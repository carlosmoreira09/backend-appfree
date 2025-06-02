import { AppDataSource } from "../data-source";
import { LoggerService } from "../services/LoggerService";
import { findUserByEmail, findRoleByName, updateUser } from "../repositories";
import { RoleType } from "../entities/Role";

const logger = LoggerService.getInstance();

/**
 * Change a user's role to admin
 * @param email User email
 */
async function changeUserRoleToAdmin(email: string) {
  try {
    // Initialize data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Data source has been initialized!");
    }

    // Find the user
    const user = await findUserByEmail(email);
    if (!user) {
      logger.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Find the admin role
    const adminRole = await findRoleByName(RoleType.ADMIN);
    if (!adminRole) {
      logger.error("Admin role not found");
      process.exit(1);
    }

    // Update the user's role
    user.role = adminRole;
    await updateUser(user);

    logger.info(`User ${email} role changed to admin successfully`);
    process.exit(0);
  } catch (error) {
    logger.error("Error changing user role:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  logger.error("Please provide a user email as an argument");
  process.exit(1);
}

// Run the function
changeUserRoleToAdmin(email);
