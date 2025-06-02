import { MonthlyBudget } from "../entities/MonthlyBudget";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "./LoggerService";
import {
  findMonthlyBudgetsByClient,
  findMonthlyBudgetById,
  findMonthlyBudgetByYearAndMonth,
  createMonthlyBudget,
  updateMonthlyBudget,
  deleteMonthlyBudget,
  findClientById
} from "../repositories";

export class MonthlyBudgetService {
  private logger = LoggerService.getInstance();

  /**
   * Get all monthly budgets for a client
   */
  public async getMonthlyBudgetsByClient(clientId: string): Promise<MonthlyBudget[]> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      return await findMonthlyBudgetsByClient(clientId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getMonthlyBudgetsByClient service for client ID ${clientId}:`, error);
      throw new AppError("Failed to get monthly budgets", 500);
    }
  }

  /**
   * Get a monthly budget by ID
   */
  public async getMonthlyBudgetById(id: string): Promise<MonthlyBudget> {
    try {
      const budget = await findMonthlyBudgetById(id);
      if (!budget) {
        throw new AppError("Monthly budget not found", 404);
      }
      return budget;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getMonthlyBudgetById service for ID ${id}:`, error);
      throw new AppError("Failed to get monthly budget", 500);
    }
  }

  /**
   * Get or create a monthly budget for a specific year and month
   */
  public async getOrCreateMonthlyBudget(
    clientId: string,
    year: number,
    month: number,
    monthlySalary?: number
  ): Promise<MonthlyBudget> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      // Check if budget already exists
      let budget = await findMonthlyBudgetByYearAndMonth(clientId, year, month);
      
      // If budget doesn't exist, create it
      if (!budget) {
        // Calculate days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Use provided monthly salary or client's salary
        const effectiveMonthlySalary = monthlySalary || client.salary;
        
        // Create new budget
        budget = await createMonthlyBudget({
          clientId,
          year,
          month,
          monthlySalary: effectiveMonthlySalary,
          budgetAmount: 0, // Will be set by client
          isPercentage: false,
          dailyBudget: 0, // Will be calculated when budget amount is set
          remainingBalance: 0, // Will be calculated when budget amount is set
          daysInMonth
        });
      }
      
      return budget;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getOrCreateMonthlyBudget service for client ${clientId}, year ${year}, month ${month}:`, error);
      throw new AppError("Failed to get or create monthly budget", 500);
    }
  }

  /**
   * Update monthly salary
   */
  public async updateMonthlySalary(
    budgetId: string,
    monthlySalary: number
  ): Promise<MonthlyBudget> {
    try {
      // Get budget
      const budget = await this.getMonthlyBudgetById(budgetId);
      
      // Update monthly salary
      budget.monthlySalary = monthlySalary;
      
      // If budget amount is a percentage, recalculate it
      if (budget.isPercentage && budget.budgetAmount > 0) {
        const percentage = budget.budgetAmount;
        const newBudgetAmount = (monthlySalary * percentage) / 100;
        
        // Update budget amount and daily budget
        budget.budgetAmount = percentage; // Keep the percentage
        budget.dailyBudget = newBudgetAmount / budget.daysInMonth;
        budget.remainingBalance = newBudgetAmount;
      }
      
      // Save updated budget
      return await updateMonthlyBudget(budget);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateMonthlySalary service for budget ID ${budgetId}:`, error);
      throw new AppError("Failed to update monthly salary", 500);
    }
  }

  /**
   * Update budget amount
   */
  public async updateBudgetAmount(
    budgetId: string,
    budgetAmount: number,
    isPercentage: boolean
  ): Promise<MonthlyBudget> {
    try {
      // Get budget
      const budget = await this.getMonthlyBudgetById(budgetId);
      
      // Calculate actual budget amount if percentage
      let actualBudgetAmount = budgetAmount;
      if (isPercentage) {
        if (budgetAmount < 0 || budgetAmount > 100) {
          throw new AppError("Percentage must be between 0 and 100", 400);
        }
        actualBudgetAmount = (budget.monthlySalary * budgetAmount) / 100;
      }
      
      // Update budget
      budget.budgetAmount = budgetAmount;
      budget.isPercentage = isPercentage;
      budget.dailyBudget = actualBudgetAmount / budget.daysInMonth;
      budget.remainingBalance = actualBudgetAmount;
      
      // Save updated budget
      return await updateMonthlyBudget(budget);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateBudgetAmount service for budget ID ${budgetId}:`, error);
      throw new AppError("Failed to update budget amount", 500);
    }
  }

  /**
   * Update remaining balance
   */
  public async updateRemainingBalance(
    budgetId: string,
    amount: number,
    isAddition: boolean = false
  ): Promise<MonthlyBudget> {
    try {
      // Get budget
      const budget = await this.getMonthlyBudgetById(budgetId);
      
      // Update remaining balance
      if (isAddition) {
        budget.remainingBalance += amount;
      } else {
        budget.remainingBalance -= amount;
      }
      
      // Save updated budget
      return await updateMonthlyBudget(budget);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateRemainingBalance service for budget ID ${budgetId}:`, error);
      throw new AppError("Failed to update remaining balance", 500);
    }
  }

  /**
   * Delete a monthly budget
   */
  public async deleteMonthlyBudget(id: string): Promise<void> {
    try {
      // Get budget
      const budget = await this.getMonthlyBudgetById(id);
      
      // Delete budget
      await deleteMonthlyBudget(budget);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in deleteMonthlyBudget service for ID ${id}:`, error);
      throw new AppError("Failed to delete monthly budget", 500);
    }
  }
}
