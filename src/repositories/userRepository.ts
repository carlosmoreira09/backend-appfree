import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { LoggerService } from "../services/LoggerService";

/**
 * Repository for User entity
 */
const userRepository = AppDataSource.getRepository(User);
const logger = LoggerService.getInstance();

/**
 * Find all users
 * @returns Array of users without passwords
 */
export const findAllUsers = async (): Promise<Omit<User, "password">[]> => {
  try {
    const users = await userRepository.find({
      select: ["id", "name", "email", "isActive", "createdAt", "updatedAt"],
    });
    return users;
  } catch (error) {
    logger.error("Error finding all users:", error);
    throw error;
  }
};

/**
 * Find a user by ID
 * @param id User ID
 * @returns User without password or null if not found
 */
export const findUserById = async (id: string): Promise<Omit<User, "password"> | null> => {
  try {
    const user = await userRepository.findOne({
      where: { id },
      select: ["id", "name", "email", "isActive", "createdAt", "updatedAt"],
      relations: ['role'],
    });
    return user;
  } catch (error) {
    logger.error(`Error finding user with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Find a user by email
 * @param email User email
 * @param includePassword Whether to include password in the result
 * @returns User or null if not found
 */
export const findUserByEmail = async (
  email: string, 
  includePassword: boolean = false
): Promise<User | null> => {
  try {
    const select = includePassword 
      ? ["id", "name", "email", "password", "isActive", "createdAt", "updatedAt"]
      : ["id", "name", "email", "isActive", "createdAt", "updatedAt"];
    
    return await userRepository.findOne({
      where: { email },
      select: select as (keyof User)[]
    });
  } catch (error) {
    logger.error(`Error finding user with email ${email}:`, error);
    throw error;
  }
};

/**
 * Create a new user
 * @param userData User data
 * @returns Created user
 */
export const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const user = userRepository.create(userData);
    return await userRepository.save(user);
  } catch (error) {
    logger.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Update a user
 * @param user User to update
 * @returns Updated user
 */
export const updateUser = async (user: User): Promise<User> => {
  try {
    return await userRepository.save(user);
  } catch (error) {
    logger.error(`Error updating user with ID ${user.id}:`, error);
    throw error;
  }
};

/**
 * Delete a user
 * @param user User to delete
 * @returns Deleted user
 */
export const deleteUser = async (user: User): Promise<User> => {
  try {
    return await userRepository.remove(user);
  } catch (error) {
    logger.error(`Error deleting user with ID ${user.id}:`, error);
    throw error;
  }
};

export default userRepository;
