import { AppDataSource } from "../config/data-source";
import { DatabaseService } from "../services/DatabaseService";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Initialize database and run migrations
 */
const initializeDatabase = async () => {
  try {
    // Initialize the data source
    const dataSource = await AppDataSource.initialize();
    console.log("Data source has been initialized!");

    // Run migrations
    await dataSource.runMigrations();
    console.log("Migrations have been executed successfully.");

    // Seed the database with initial data
    await DatabaseService.seedDatabase();
    console.log("Database seeding completed.");

    // Close the connection
    await dataSource.destroy();
    console.log("Connection closed.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }
};

// Run the initialization
initializeDatabase();
