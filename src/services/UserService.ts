import * as bcrypt from "bcryptjs";
import { User } from "../entities/User";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "./LoggerService";
import {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  findUserByIdWithPassword
} from "../repositories";

export class UserService {
  private logger = LoggerService.getInstance();

  /**
   * Get all users
   */
  public async getAllUsers(): Promise<Omit<User, "password">[]> {
    try {
      return await findAllUsers();
    } catch (error) {
      this.logger.error("Error in getAllUsers service:", error);
      throw new AppError("Failed to get users", 500);
    }
  }

  /**
   * Get a user by ID
   */
  public async getUserById(id: string): Promise<Omit<User, "password">> {
    try {
      const user = await findUserById(id);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getUserById service for ID ${id}:`, error);
      throw new AppError("Failed to get user", 500);
    }
  }

  /**
   * Get a user by ID with password (for authentication purposes)
   */
  public async getUserWithPassword(id: string): Promise<User> {
    try {
      const user = await findUserByIdWithPassword(id);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getUserWithPassword service for ID ${id}:`, error);
      throw new AppError("Failed to get user", 500);
    }
  }

  /**
   * Create a new user
   */
  public async createUser(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<Omit<User, "password">> {
    try {
      const { name, email, password } = userData;

      // Check if user with email already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throw new AppError("User with this email already exists", 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await createUser({
        name,
        email,
        password: hashedPassword
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in createUser service:", error);
      throw new AppError("Failed to create user", 500);
    }
  }

  /**
   * Update a user
   */
  public async updateUser(
    id: string,
    updateData: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    }
  ): Promise<Omit<User, "password">> {
    try {
      const { name, email, password, isActive } = updateData;

      // Find user
      const user = await findUserById(id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Create updated user object
      const updatedUser: any = { ...user };

      // Update user properties
      if (name !== undefined) updatedUser.name = name;

      // If email is being updated, check it's not already in use
      if (email !== undefined && email !== user.email) {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
          throw new AppError("Email is already in use", 409);
        }
        updatedUser.email = email;
      }

      // If password is being updated, hash it
      if (password !== undefined) {
        updatedUser.password = await bcrypt.hash(password, 10);
      }

      if (isActive !== undefined) updatedUser.isActive = isActive;

      // Save updated user
      const savedUser = await updateUser(updatedUser);

      // Return updated user without password
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateUser service for ID ${id}:`, error);
      throw new AppError("Failed to update user", 500);
    }
  }

  /**
   * Update user password
   */
  public async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      // Find user
      const user = await findUserById(id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user with new password
      await updateUser({
        ...user,
        password: hashedPassword
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updatePassword service for ID ${id}:`, error);
      throw new AppError("Failed to update password", 500);
    }
  }

  /**
   * Delete a user
   */
  public async deleteUser(id: string): Promise<void> {
    try {
      // Find user
      const user = await findUserById(id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Delete user
      await deleteUser(user as any); // Type casting needed due to Omit<User, "password">
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in deleteUser service for ID ${id}:`, error);
      throw new AppError("Failed to delete user", 500);
    }
  }
}
