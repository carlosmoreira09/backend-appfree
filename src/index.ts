import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { initializeDataSource } from "./config/data-source";
import routes from "./routes";
import { errorMiddleware } from "./middlewares";
import { LoggerService } from "./services";

dotenv.config();

const logger = LoggerService.getInstance();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

app.use("/api", routes);

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.get("/check", (_, res) => {
  res.status(200).json({ 
    message: "App is running", 
    status: "online", 
    timestamp: new Date() 
  });
});

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await initializeDataSource();
    logger.info("Database connection initialized successfully");
    
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
