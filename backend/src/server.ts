import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { testConnection } from "./config/database";
import routes from "./routes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc)
      // and all origins in development
      callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Activity Registration System API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
      auth: "/api/auth",
      activities: "/api/activities",
      registrations: "/api/registrations",
      statistics: "/api/statistics",
    },
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log("");
      console.log("═══════════════════════════════════════════════════════");
      console.log("🚀  Activity Registration System - Backend API");
      console.log("═══════════════════════════════════════════════════════");
      console.log(`📡  Server running on: http://localhost:${PORT}`);
      console.log(`🌍  Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🗄️   Database: ${process.env.DB_NAME || "activity_system"}`);
      console.log(`🔗  API Base URL: http://localhost:${PORT}/api`);
      console.log(`💚  Health Check: http://localhost:${PORT}/health`);
      console.log("═══════════════════════════════════════════════════════");
      console.log("");
      console.log("📚  Available Endpoints:");
      console.log("   • POST   /api/auth/login");
      console.log("   • POST   /api/auth/register/student");
      console.log("   • GET    /api/auth/profile");
      console.log("   • GET    /api/activities");
      console.log("   • POST   /api/activities");
      console.log("   • POST   /api/registrations/register");
      console.log("   • GET    /api/statistics/overall");
      console.log("");
      console.log("Press Ctrl+C to stop the server");
      console.log("");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received. Shutting down gracefully...");
  process.exit(0);
});

startServer();

export default app;
