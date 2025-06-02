import { Between } from "typeorm";
import { AppDataSource } from "../data-source";
import { MonthlyBudget } from "../entities/MonthlyBudget";
import { LoggerService } from "../services/LoggerService";

/**
 * Repository for MonthlyBudget entity
 */
const monthlyBudgetRepository = AppDataSource.getRepository(MonthlyBudget);
const logger = LoggerService.getInstance();

/**
 * Find all monthly budgets for a client
 * @param clientId Client ID
 * @returns Array of monthly budgets
 */
export const findMonthlyBudgetsByClient = async (clientId: string): Promise<MonthlyBudget[]> => {
  try {
    return await monthlyBudgetRepository.find({
      where: { clientId },
      order: { year: "DESC", month: "DESC" }
    });
  } catch (error) {
    logger.error(`Error finding monthly budgets for client ${clientId}:`, error);
    throw error;
  }
};

/**
 * Find a monthly budget by ID
 * @param id Monthly budget ID
 * @returns Monthly budget or null if not found
 */
export const findMonthlyBudgetById = async (id: string): Promise<MonthlyBudget | null> => {
  try {
    return await monthlyBudgetRepository.findOne({
      where: { id },
      relations: ["client"]
    });
  } catch (error) {
    logger.error(`Error finding monthly budget with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Find a monthly budget by client, year, and month
 * @param clientId Client ID
 * @param year Year
 * @param month Month
 * @returns Monthly budget or null if not found
 */
export const findMonthlyBudgetByYearAndMonth = async (
  clientId: string,
  year: number,
  month: number
): Promise<MonthlyBudget | null> => {
  try {
    return await monthlyBudgetRepository.findOne({
      where: { clientId, year, month }
    });
  } catch (error) {
    logger.error(`Error finding monthly budget for client ${clientId}, year ${year}, month ${month}:`, error);
    throw error;
  }
};

/**
 * Create a new monthly budget
 * @param budgetData Monthly budget data
 * @returns Created monthly budget
 */
export const createMonthlyBudget = async (budgetData: Partial<MonthlyBudget>): Promise<MonthlyBudget> => {
  try {
    const budget = monthlyBudgetRepository.create(budgetData);
    return await monthlyBudgetRepository.save(budget);
  } catch (error) {
    logger.error("Error creating monthly budget:", error);
    throw error;
  }
};

/**
 * Update a monthly budget
 * @param budget Monthly budget to update
 * @returns Updated monthly budget
 */
export const updateMonthlyBudget = async (budget: MonthlyBudget): Promise<MonthlyBudget> => {
  try {
    return await monthlyBudgetRepository.save(budget);
  } catch (error) {
    logger.error(`Error updating monthly budget with ID ${budget.id}:`, error);
    throw error;
  }
};

/**
 * Delete a monthly budget
 * @param budget Monthly budget to delete
 * @returns Deleted monthly budget
 */
export const deleteMonthlyBudget = async (budget: MonthlyBudget): Promise<MonthlyBudget> => {
  try {
    return await monthlyBudgetRepository.remove(budget);
  } catch (error) {
    logger.error(`Error deleting monthly budget with ID ${budget.id}:`, error);
    throw error;
  }
};

export default monthlyBudgetRepository;
