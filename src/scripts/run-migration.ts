import { AppDataSource } from "../data-source";
import { CreateMonthlyBudgetAndDailyTransaction1717326100000 } from "../migrations/1717326100000-CreateMonthlyBudgetAndDailyTransaction";
import { LoggerService } from "../services/LoggerService";

const logger = LoggerService.getInstance();

async function runMigration() {
  try {
    // Initialize data source
    await AppDataSource.initialize();
    logger.info("Data source initialized");

    // Run migration
    const migration = new CreateMonthlyBudgetAndDailyTransaction1717326100000();
    await migration.up(AppDataSource.createQueryRunner());
    logger.info("Migration executed successfully");

    // Close connection
    await AppDataSource.destroy();
    logger.info("Connection closed");
  } catch (error) {
    logger.error("Error running migration:", error);
    process.exit(1);
  }
}

runMigration()
  .then(() => {
    logger.info("Migration process completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
  });
