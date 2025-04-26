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

  // Try to use port 5000 (workflow default) but fall back to others if needed
  const tryStartServer = (attemptPort: number, maxAttempts = 5, currentAttempt = 1) => {
    // Simple approach: just try to listen on the port directly
    server.listen({
      port: attemptPort,
      host: "0.0.0.0",
    }, () => {
      log(`serving on port ${attemptPort}`);
      if (attemptPort !== 5000) {
        console.log(`Note: Using alternative port ${attemptPort} instead of default port 5000`);
      }
    }).on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        if (currentAttempt < maxAttempts) {
          // Try the next port in sequence (with a small offset to avoid sequential conflicts)
          const nextPort = attemptPort + 10;
          console.log(`Port ${attemptPort} is in use, trying port ${nextPort}...`);
          tryStartServer(nextPort, maxAttempts, currentAttempt + 1);
        } else {
          console.error(`Failed to find an available port after ${maxAttempts} attempts.`);
          process.exit(1);
        }
      } else {
        console.error('Server failed to start:', error);
        process.exit(1);
      }
    });
  };

  // Set up error handlers
  process.on('uncaughtException', (error: any) => {
    console.error('Uncaught Exception:', error);
    // If the error is EADDRINUSE, the error handler in tryStartServer will handle it
    // But we've seen cases where it bypasses that handler
    if (error.code === 'EADDRINUSE') {
      // Try a fallback port directly
      console.log('Caught EADDRINUSE at process level, trying fallback port 5050...');
      tryStartServer(5050);
    } else {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Try to start with preferred port
  const preferredPort = parseInt(process.env.PORT || '5000');
  tryStartServer(preferredPort);
})();