import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { LoggerService } from "./services/LoggerService";
import { join } from "path";

// Load environment variables from .env file
dotenv.config();

// Initialize logger
const logger = LoggerService.getInstance();

// Determine if we're in production or development
const isProd = process.env.NODE_ENV === "production";
const rootDir = isProd ? "dist" : "src";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "appfree",
    synchronize: process.env.NODE_ENV === "development", // Auto-create database schema in development
    logging: process.env.NODE_ENV === "development",
    entities: [join(rootDir, "/entities/**/*.{js,ts}")],
    migrations: [join(rootDir, "/migrations/**/*.{js,ts}")],
    subscribers: [join(rootDir, "/subscribers/**/*.{js,ts}")],
});

// Initialize the data source
export const initializeDataSource = async (): Promise<DataSource> => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            logger.info("Data Source has been initialized!");
        }
        return AppDataSource;
    } catch (error) {
        logger.error("Error during Data Source initialization:", error);
        throw error;
    }
};
