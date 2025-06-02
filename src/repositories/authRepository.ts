import { AppDataSource } from "../data-source";
import { Auth, AuthType } from "../entities/Auth";
import { LoggerService } from "../services/LoggerService";

/**
 * Repository for Auth entity
 */
const authRepository = AppDataSource.getRepository(Auth);
const logger = LoggerService.getInstance();

/**
 * Find all auth records
 * @returns Array of auth records
 */
export const findAllAuth = async (): Promise<Auth[]> => {
  try {
    return await authRepository.find({
      relations: ["user", "client"]
    });
  } catch (error) {
    logger.error("Error finding all auth records:", error);
    throw error;
  }
};

/**
 * Find an auth record by ID
 * @param id Auth ID
 * @returns Auth record or null if not found
 */
export const findAuthById = async (id: string): Promise<Auth | null> => {
  try {
    return await authRepository.findOne({
      where: { id },
      relations: ["user", "client"]
    });
  } catch (error) {
    logger.error(`Error finding auth with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Find an auth record by email
 * @param email Email
 * @param includePassword Whether to include password in the result
 * @returns Auth record or null if not found
 */
export const findAuthByEmail = async (
  email: string,
  includePassword: boolean = false
): Promise<Auth | null> => {
  try {
    const select = includePassword
      ? ["id", "email", "password", "type", "isActive", "lastLogin", "refreshToken", "refreshTokenExpiry", "userId", "clientId", "createdAt", "updatedAt"]
      : ["id", "email", "type", "isActive", "lastLogin", "refreshToken", "refreshTokenExpiry", "userId", "clientId", "createdAt", "updatedAt"];

    return await authRepository.findOne({
      where: { email },
      select: select as (keyof Auth)[],
      relations: ["user", "client"]
    });
  } catch (error) {
    logger.error(`Error finding auth with email ${email}:`, error);
    throw error;
  }
};

/**
 * Find an auth record by user ID
 * @param userId User ID
 * @returns Auth record or null if not found
 */
export const findAuthByUserId = async (userId: string): Promise<Auth | null> => {
  try {
    return await authRepository.findOne({
      where: { userId },
      relations: ["user"]
    });
  } catch (error) {
    logger.error(`Error finding auth with user ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Find an auth record by client ID
 * @param clientId Client ID
 * @returns Auth record or null if not found
 */
export const findAuthByClientId = async (clientId: string): Promise<Auth | null> => {
  try {
    return await authRepository.findOne({
      where: { clientId },
      relations: ["client"]
    });
  } catch (error) {
    logger.error(`Error finding auth with client ID ${clientId}:`, error);
    throw error;
  }
};

/**
 * Create a new auth record
 * @param authData Auth data
 * @returns Created auth record
 */
export const createAuth = async (authData: Partial<Auth>): Promise<Auth> => {
  try {
    const auth = authRepository.create(authData);
    return await authRepository.save(auth);
  } catch (error) {
    logger.error("Error creating auth:", error);
    throw error;
  }
};

/**
 * Update an auth record
 * @param auth Auth record to update
 * @returns Updated auth record
 */
export const updateAuth = async (auth: Auth): Promise<Auth> => {
  try {
    return await authRepository.save(auth);
  } catch (error) {
    logger.error(`Error updating auth with ID ${auth.id}:`, error);
    throw error;
  }
};

/**
 * Delete an auth record
 * @param auth Auth record to delete
 * @returns Deleted auth record
 */
export const deleteAuth = async (auth: Auth): Promise<Auth> => {
  try {
    return await authRepository.remove(auth);
  } catch (error) {
    logger.error(`Error deleting auth with ID ${auth.id}:`, error);
    throw error;
  }
};

/**
 * Update last login for an auth record
 * @param id Auth ID
 * @returns Updated auth record
 */
export const updateLastLogin = async (id: string): Promise<Auth | null> => {
  try {
    const auth = await findAuthById(id);
    if (!auth) return null;
    
    auth.lastLogin = new Date();
    return await authRepository.save(auth);
  } catch (error) {
    logger.error(`Error updating last login for auth with ID ${id}:`, error);
    throw error;
  }
};

export default authRepository;
