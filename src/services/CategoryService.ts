import { Category } from "../entities/Category";
import { Client } from "../entities/Client";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "./LoggerService";
import {
  findClientById,
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../repositories";

export class CategoryService {
  private logger = LoggerService.getInstance();

  /**
   * Get all categories for a client
   */
  public async getAllCategories(clientId: string): Promise<Category[]> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      // Get categories
      return await findAllCategories(clientId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in getAllCategories service:", error);
      throw new AppError("Failed to get categories", 500);
    }
  }

  /**
   * Get a category by ID
   */
  public async getCategoryById(id: string, clientId: string): Promise<Category> {
    try {
      const category = await findCategoryById(id, clientId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
      return category;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getCategoryById service for ID ${id}:`, error);
      throw new AppError("Failed to get category", 500);
    }
  }

  /**
   * Create a new category
   */
  public async createCategory(
    clientId: string,
    categoryData: {
      name: string;
      color?: string;
      icon?: string;
    }
  ): Promise<Category> {
    try {
      const { name, color, icon } = categoryData;

      // Find client
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      // Check if category with same name already exists for this client
      const existingCategories = await findAllCategories(clientId);
      const categoryExists = existingCategories.some(
        c => c.name.toLowerCase() === name.toLowerCase()
      );
      
      if (categoryExists) {
        throw new AppError("Category with this name already exists", 409);
      }

      // Create category object
      const newCategory: Partial<Category> = {
        name,
        color: color || this.generateRandomColor(),
        icon: icon || "default",
        client,
        clientId
      };

      // Save category
      return await createCategory(newCategory);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in createCategory service:", error);
      throw new AppError("Failed to create category", 500);
    }
  }

  /**
   * Update a category
   */
  public async updateCategory(
    id: string,
    clientId: string,
    updateData: {
      name?: string;
      color?: string;
      icon?: string;
    }
  ): Promise<Category> {
    try {
      const { name, color, icon } = updateData;

      // Find category
      const category = await this.getCategoryById(id, clientId);

      // If name is being updated, check if it already exists
      if (name && name !== category.name) {
        const existingCategories = await findAllCategories(clientId);
        const categoryExists = existingCategories.some(
          c => c.name.toLowerCase() === name.toLowerCase() && c.id !== id
        );
        
        if (categoryExists) {
          throw new AppError("Category with this name already exists", 409);
        }
      }

      // Update category properties
      if (name !== undefined) category.name = name;
      if (color !== undefined) category.color = color;
      if (icon !== undefined) category.icon = icon;

      // Save updated category
      return await updateCategory(category);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateCategory service for ID ${id}:`, error);
      throw new AppError("Failed to update category", 500);
    }
  }

  /**
   * Delete a category
   */
  public async deleteCategory(id: string, clientId: string): Promise<void> {
    try {
      // Find category
      const category = await this.getCategoryById(id, clientId);

      // Delete category
      await deleteCategory(category);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in deleteCategory service for ID ${id}:`, error);
      throw new AppError("Failed to delete category", 500);
    }
  }

  /**
   * Generate a random color for categories
   */
  private generateRandomColor(): string {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
