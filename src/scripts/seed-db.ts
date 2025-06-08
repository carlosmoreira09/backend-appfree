import { AppDataSource } from "../config/data-source";
import { DatabaseService } from "../services/DatabaseService";
import { LoggerService } from "../services/LoggerService";

const logger = LoggerService.getInstance();

/**
 * Initialize and seed the database
 */
async function seedDatabase() {
  try {
    // Initialize data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Data source has been initialized!");
    }

    // Seed database with initial data
    await DatabaseService.seedDatabase();
    
    logger.info("Database seeding completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error during database seeding:", error);
    process.exit(1);
  }
}

// Run the initialization
seedDatabase();
