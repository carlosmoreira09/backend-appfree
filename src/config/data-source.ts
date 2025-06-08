import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { LoggerService } from "../services/LoggerService";
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
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, // Auto-create database schema in development
    logging: false,
    entities: [join(rootDir, "/entities/**/*.{js,ts}")],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
