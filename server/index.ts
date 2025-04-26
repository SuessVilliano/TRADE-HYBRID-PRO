import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { encryptionService } from "./lib/services/encryption-service";
import { brokerConnectionService } from "./lib/services/broker-connection-service";
import { userIdentityService } from "./lib/services/user-identity-service";
import { updateApiCredentials } from "./update-env";
import apiRouter from "./routes/index";
// Using mock prop firm service instead of the actual one for development
// import { propFirmService } from "./lib/services/prop-firm-service";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session middleware with secure cookies and extended persistence
app.use(session({
  secret: process.env.SESSION_SECRET || 'trade-hybrid-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevents client-side JS from reading the cookie
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days for long-term persistence
    sameSite: 'lax' // Helps with CSRF
  },
  rolling: true // Reset expiration countdown on each response
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Update API credentials before initializing services
  console.log('Updating API credentials...');
  updateApiCredentials();
  console.log('API credentials updated successfully');
  console.log(`Using ALPACA_API_KEY: ${process.env.ALPACA_API_KEY}`);
  
  // Initialize services that need initialization
  // encryptionService is self-initializing in its constructor
  await brokerConnectionService.initialize();
  // Skip prop firm service initialization since we're using the mock version
  // await propFirmService.initialize();
  
  // Log successful initialization
  console.log('Services initialized successfully');
  
  // Register our API router for the validator endpoints
  app.use('/api', apiRouter);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    //Throwing the error here might be undesirable in a production environment.  Consider logging instead.
    //throw err; 
    console.error("Server Error:", err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Simple variable to store the active server port
  let activeServerPort: number | null = null;

  // Ensure port 5000 is not in use (important for workflow)
  const releasePort5000 = () => {
    return new Promise<void>((resolve) => {
      // Create a test server to try to release port 5000
      // Use Node.js http module properly with ES modules
      import('http').then(httpModule => {
        const testServer = httpModule.createServer();
        testServer.once('error', () => {
          console.log('Port 5000 is already in use by another process, will try alternative ports');
          resolve();
        });
        
        testServer.once('listening', () => {
          console.log('Successfully claimed port 5000 temporarily to verify availability');
          testServer.close(() => {
            console.log('Released port 5000 for our main server to use');
            resolve();
          });
        });
        
        // Try to listen on port 5000
        testServer.listen(5000, '0.0.0.0');
      }).catch(err => {
        console.error('Error importing http module:', err);
        resolve(); // Continue anyway
      });
    });
  };

  // New approach to server startup
  const startServer = async (): Promise<void> => {
    // Try to release port 5000 first
    await releasePort5000();
    
    // Try port 5000 first to satisfy the workflow, then fallback to others
    const portsToTry = [5000, 5050, 8080, 3000];
    
    // Attempt to start on each port in sequence
    for (const port of portsToTry) {
      try {
        // Don't log anything until we actually start successfully
        await new Promise<void>((resolve, reject) => {
          server.listen({ port, host: "0.0.0.0" })
            .once('listening', () => {
              // Success! Update the active port and log it
              activeServerPort = port;
              log(`server successfully started on port ${port}`);
              if (port !== 5000) {
                console.log(`Note: Using port ${port} instead of the default port 5000`);
              }
              resolve();
            })
            .once('error', (err: any) => {
              if (err.code === 'EADDRINUSE') {
                // Just reject so we can try the next port
                reject(new Error(`Port ${port} is already in use`));
              } else {
                // For other errors, log and reject
                console.error(`Error starting server on port ${port}:`, err);
                reject(err);
              }
            });
        });
        
        // If we get here, we've successfully started the server
        return;
      } catch (err) {
        // Port was in use or other error, try the next one
        console.log(`Could not start on port ${port}, trying next port...`);
        continue;
      }
    }
    
    // If we get here, we've exhausted all ports
    throw new Error("Could not start server on any available port");
  };

  // Simplified error handlers
  process.on('uncaughtException', (error: any) => {
    console.error('Uncaught Exception:', error);
    
    // If we still couldn't start the server at all
    if (!activeServerPort) {
      console.error('Server failed to start:', error);
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Function to delay execution (useful for waiting for ports to be released)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Start the server with our new approach
  try {
    // First try
    try {
      await startServer();
    } catch (err) {
      console.log('First attempt failed, waiting for 2 seconds before retrying...');
      // Wait 2 seconds and try again - sometimes ports need time to be released
      await delay(2000);
      await startServer();
    }
  } catch (err) {
    console.error('Failed to start server after multiple attempts:', err);
    process.exit(1);
  }
})();