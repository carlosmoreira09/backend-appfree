import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initializeDataSource } from "./data-source";
import routes from "./routes";
import { errorMiddleware } from "./middlewares";
import { LoggerService } from "./services";

// Load environment variables
dotenv.config();

// Initialize logger
const logger = LoggerService.getInstance();

// Create Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Error handling middleware
app.use(errorMiddleware);

// Start the server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDataSource();
    logger.info("Database connection initialized successfully");
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
