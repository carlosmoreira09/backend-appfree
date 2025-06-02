import { Role, RoleType } from "../entities/Role";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "./LoggerService";
import {
  findAllRoles,
  findRoleById,
  findRoleByName,
  createRole,
  updateRole,
  deleteRole
} from "../repositories";

export class RoleService {
  private logger = LoggerService.getInstance();

  /**
   * Get all roles
   */
  public async getAllRoles(): Promise<Role[]> {
    try {
      return await findAllRoles();
    } catch (error) {
      this.logger.error("Error in getAllRoles service:", error);
      throw new AppError("Failed to get roles", 500);
    }
  }

  /**
   * Get a role by ID
   */
  public async getRoleById(id: string): Promise<Role> {
    try {
      const role = await findRoleById(id);
      if (!role) {
        throw new AppError("Role not found", 404);
      }
      return role;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getRoleById service for ID ${id}:`, error);
      throw new AppError("Failed to get role", 500);
    }
  }

  /**
   * Get a role by name
   */
  public async getRoleByName(name: RoleType): Promise<Role> {
    try {
      const role = await findRoleByName(name);
      if (!role) {
        throw new AppError("Role not found", 404);
      }
      return role;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getRoleByName service for name ${name}:`, error);
      throw new AppError("Failed to get role", 500);
    }
  }

  /**
   * Create a new role
   */
  public async createRole(roleData: {
    name: RoleType;
    description?: string;
  }): Promise<Role> {
    try {
      const { name, description } = roleData;

      // Check if role with name already exists
      const existingRole = await findRoleByName(name);
      if (existingRole) {
        throw new AppError("Role with this name already exists", 409);
      }

      // Create role
      const newRole = await createRole({
        name,
        description
      });

      return newRole;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in createRole service:", error);
      throw new AppError("Failed to create role", 500);
    }
  }

  /**
   * Update a role
   */
  public async updateRole(
    id: string,
    updateData: {
      name?: RoleType;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<Role> {
    try {
      const { name, description, isActive } = updateData;

      // Find role
      const role = await this.getRoleById(id);

      // If name is being updated, check it's not already in use
      if (name && name !== role.name) {
        const existingRole = await findRoleByName(name);
        if (existingRole) {
          throw new AppError("Role with this name already exists", 409);
        }
      }

      // Update role properties
      if (name !== undefined) role.name = name;
      if (description !== undefined) role.description = description;
      if (isActive !== undefined) role.isActive = isActive;

      // Save updated role
      return await updateRole(role);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateRole service for ID ${id}:`, error);
      throw new AppError("Failed to update role", 500);
    }
  }

  /**
   * Delete a role
   */
  public async deleteRole(id: string): Promise<void> {
    try {
      // Find role
      const role = await this.getRoleById(id);

      // Delete role
      await deleteRole(role);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in deleteRole service for ID ${id}:`, error);
      throw new AppError("Failed to delete role", 500);
    }
  }
}
