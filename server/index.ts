import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { encryptionService } from "./lib/services/encryption-service";
import { brokerConnectionService } from "./lib/services/broker-connection-service";
import { userIdentityService } from "./lib/services/user-identity-service";
import { updateApiCredentials } from "./update-env";
import apiRouter from "./routes/index";
// Import MCP (Message Control Plane) server
import { registerMCPRoutes, initializeMCPServer, shutdownMCPServer } from "./mcp";
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
  
  // Import and use the user management routes
  const userManagementRouter = (await import("./api/user-management")).default;
  app.use("/api/auth", userManagementRouter);
  
  const server = await registerRoutes(app);
  
  // Initialize and register MCP routes
  registerMCPRoutes(app, server);
  console.log('MCP server routes registered');

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

  // Use port 5000 for Replit compatibility 
  const port = process.env.PORT || 5000;

  // Start server directly on port 5000 for Cloud Run
  const startServer = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      server.listen({ port: Number(port), host: "0.0.0.0" })
        .once('listening', () => {
          log(`server successfully started on port ${port}`);
          resolve();
        })
        .once('error', (err: any) => {
          console.error(`Error starting server on port ${port}:`, err);
          reject(err);
        });
    });
  };

  // Error handlers
  process.on('uncaughtException', (error: any) => {
    console.error('Uncaught Exception:', error);
    shutdownMCPServer();
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  // Gracefully shutdown on process termination
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    shutdownMCPServer();
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT signal received. Shutting down gracefully...');
    shutdownMCPServer();
    process.exit(0);
  });

  // Start the server
  try {
    await startServer();
  } catch (err) {
    console.error('Failed to start server:', err);
    shutdownMCPServer();
    process.exit(1);
  }
})();