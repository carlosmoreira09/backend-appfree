import { AppDataSource } from "../config/data-source";
import { Category } from "../entities/Category";
import { LoggerService } from "../services/LoggerService";

/**
 * Repository for Category entity
 */
const categoryRepository = AppDataSource.getRepository(Category);
const logger = LoggerService.getInstance();

/**
 * Find all categories for a client
 * @param clientId Client ID
 * @returns Array of categories
 */
export const findAllCategories = async (): Promise<Category[]> => {
  try {
    return await categoryRepository.find({
      order: { name: "ASC" }
    });
  } catch (error) {
    logger.error("Error finding all categories:", error);
    throw error;
  }
};

/**
 * Find a category by ID for a specific client
 * @param id Category ID
 * @param clientId Client ID
 * @returns Category or null if not found
 */
export const findCategoryById = async (id: string): Promise<Category | null> => {
  try {
    return await categoryRepository.findOne({
      where: { 
        id: id,
      }
    });
  } catch (error) {
    logger.error(`Error finding category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new category
 * @param categoryData Category data
 * @returns Created category
 */
export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  try {
    const category = categoryRepository.create(categoryData);
    return await categoryRepository.save(category);
  } catch (error) {
    logger.error("Error creating category:", error);
    throw error;
  }
};

/**
 * Update a category
 * @param category Category to update
 * @returns Updated category
 */
export const updateCategory = async (category: Category): Promise<Category> => {
  try {
    return await categoryRepository.save(category);
  } catch (error) {
    logger.error(`Error updating category with ID ${category.id}:`, error);
    throw error;
  }
};

/**
 * Delete a category
 * @param category Category to delete
 * @returns Deleted category
 */
export const deleteCategory = async (category: Category): Promise<Category> => {
  try {
    return await categoryRepository.remove(category);
  } catch (error) {
    logger.error(`Error deleting category with ID ${category.id}:`, error);
    throw error;
  }
};

export default categoryRepository;
