import { AppDataSource } from "../config/data-source";
import { Role, RoleType } from "../entities/Role";
import { LoggerService } from "../services/LoggerService";

/**
 * Repository for Role entity
 */
const roleRepository = AppDataSource.getRepository(Role);
const logger = LoggerService.getInstance();

/**
 * Find all roles
 * @returns Array of roles
 */
export const findAllRoles = async (): Promise<Role[]> => {
  try {
    return await roleRepository.find({
      order: { name: "ASC" }
    });
  } catch (error) {
    logger.error("Error finding all roles:", error);
    throw error;
  }
};

/**
 * Find a role by ID
 * @param id Role ID
 * @returns Role or null if not found
 */
export const findRoleById = async (id: string): Promise<Role | null> => {
  try {
    return await roleRepository.findOne({
      where: { id }
    });
  } catch (error) {
    logger.error(`Error finding role with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Find a role by name
 * @param name Role name
 * @returns Role or null if not found
 */
export const findRoleByName = async (name: RoleType): Promise<Role | null> => {
  try {
    return await roleRepository.findOne({
      where: { name }
    });
  } catch (error) {
    logger.error(`Error finding role with name ${name}:`, error);
    throw error;
  }
};

/**
 * Create a new role
 * @param roleData Role data
 * @returns Created role
 */
export const createRole = async (roleData: Partial<Role>): Promise<Role> => {
  try {
    const role = roleRepository.create(roleData);
    return await roleRepository.save(role);
  } catch (error) {
    logger.error("Error creating role:", error);
    throw error;
  }
};

/**
 * Update a role
 * @param role Role to update
 * @returns Updated role
 */
export const updateRole = async (role: Role): Promise<Role> => {
  try {
    return await roleRepository.save(role);
  } catch (error) {
    logger.error(`Error updating role with ID ${role.id}:`, error);
    throw error;
  }
};

/**
 * Delete a role
 * @param role Role to delete
 * @returns Deleted role
 */
export const deleteRole = async (role: Role): Promise<Role> => {
  try {
    return await roleRepository.remove(role);
  } catch (error) {
    logger.error(`Error deleting role with ID ${role.id}:`, error);
    throw error;
  }
};

export default roleRepository;
