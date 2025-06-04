import { DailyTransaction, TransactionType } from "../entities/DailyTransaction";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "./LoggerService";
import {
  findDailyTransactionsByClient,
  findDailyTransactionsByDate,
  findDailyTransactionsByMonth,
  findDailyTransactionsByMonthlyBudget,
  findDailyTransactionById,
  createDailyTransaction,
  updateDailyTransaction,
  deleteDailyTransaction,
  getDailyTransactionsSumByDate,
  getDailyTransactionsSumByMonth,
  findClientById,
  findCategoryById,
  findMonthlyBudgetById,
  findMonthlyBudgetByYearAndMonth
} from "../repositories";
import { MonthlyBudgetService } from "./MonthlyBudgetService";

export class DailyTransactionService {
  private logger = LoggerService.getInstance();
  private monthlyBudgetService = new MonthlyBudgetService();

  /**
   * Get all daily transactions for a client
   */
  public async getDailyTransactionsByClient(
      clientId?: string,
      page: number = 1,
      limit: number = 10,): Promise<{ transactions: DailyTransaction[], total: number }> {
    try {
      if(clientId) {
        const client = await findClientById(clientId);
        if (!client) {
          throw new AppError("Client not found", 404);
        }
        return await findDailyTransactionsByClient(page, limit,clientId);

      } else {
        return await findDailyTransactionsByClient(page, limit);

      }

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getDailyTransactionsByClient service for client ID ${clientId}:`, error);
      throw new AppError("Failed to get daily transactions", 500);
    }
  }

  /**
   * Get daily transactions for a client by date
   */
  public async getDailyTransactionsByDate(clientId: string, date: Date): Promise<DailyTransaction[]> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      return await findDailyTransactionsByDate(clientId, date);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getDailyTransactionsByDate service for client ID ${clientId}, date ${date}:`, error);
      throw new AppError("Failed to get daily transactions", 500);
    }
  }

  /**
   * Get daily transactions for a client by month
   */
  public async getDailyTransactionsByMonth(
    clientId: string,
    year: number,
    month: number
  ): Promise<DailyTransaction[]> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      return await findDailyTransactionsByMonth(clientId, year, month);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getDailyTransactionsByMonth service for client ID ${clientId}, month ${month}/${year}:`, error);
      throw new AppError("Failed to get daily transactions", 500);
    }
  }

  /**
   * Get a daily transaction by ID
   */
  public async getDailyTransactionById(id: string): Promise<DailyTransaction> {
    try {
      const transaction = await findDailyTransactionById(id);
      if (!transaction) {
        throw new AppError("Daily transaction not found", 404);
      }
      return transaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getDailyTransactionById service for ID ${id}:`, error);
      throw new AppError("Failed to get daily transaction", 500);
    }
  }

  /**
   * Create a new daily transaction
   */
  public async createDailyTransaction(transactionData: {
    description: string;
    amount: number;
    type: TransactionType;
    date: Date;
    clientId: string;
    categoryId?: string;
  }): Promise<DailyTransaction> {
    try {
      const { description, amount, type, date, clientId, categoryId } = transactionData;

      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      // Validate category exists if provided
      if (categoryId) {
        const category = await findCategoryById(categoryId, clientId);
        if (!category) {
          throw new AppError("Category not found", 404);
        }
        
        // Validate category belongs to client
        if (category.clientId !== clientId) {
          throw new AppError("Category does not belong to client", 403);
        }
      }

      // Get or create monthly budget for the transaction date
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const monthlyBudget = await this.monthlyBudgetService.getOrCreateMonthlyBudget(clientId, year, month);

      // Calculate remaining balance after transaction
      let remainingBalanceAfterTransaction = monthlyBudget.remainingBalance;
      if (type === TransactionType.EXPENSE) {
        remainingBalanceAfterTransaction -= amount;
      } else {
        remainingBalanceAfterTransaction += amount;
      }

      // Create transaction
      const transaction = await createDailyTransaction({
        description,
        amount,
        type,
        date,
        remainingBalanceAfterTransaction,
        clientId,
        categoryId,
        monthlyBudgetId: monthlyBudget.id
      });

      // Update monthly budget remaining balance
      await this.monthlyBudgetService.updateRemainingBalance(
        monthlyBudget.id,
        amount,
        type === TransactionType.INCOME // If income, add to remaining balance
      );

      return transaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in createDailyTransaction service:", error);
      throw new AppError("Failed to create daily transaction", 500);
    }
  }

  /**
   * Update a daily transaction
   */
  public async updateDailyTransaction(
    id: string,
    updateData: {
      description?: string;
      amount?: number;
      type?: TransactionType;
      date?: Date;
      categoryId?: string;
    }
  ): Promise<DailyTransaction> {
    try {
      const { description, amount, type, date, categoryId } = updateData;

      // Get transaction
      const transaction = await this.getDailyTransactionById(id);
      
      // Store original values for comparison
      const originalAmount = transaction.amount;
      const originalType = transaction.type;
      const originalDate = transaction.date;
      
      // Check if date is changing to a different month
      let monthChanged = false;
      if (date && (date.getMonth() !== originalDate.getMonth() || date.getFullYear() !== originalDate.getFullYear())) {
        monthChanged = true;
      }

      // Validate category exists if provided
      if (categoryId && categoryId !== transaction.categoryId) {
        const category = await findCategoryById(categoryId, transaction.clientId);
        if (!category) {
          throw new AppError("Category not found", 404);
        }
        
        transaction.category = category;
        transaction.categoryId = categoryId;
      }

      // Update transaction properties
      if (description !== undefined) transaction.description = description;
      if (type !== undefined) transaction.type = type;
      if (date !== undefined) transaction.date = date;

      // Handle amount and balance updates
      if (amount !== undefined || type !== undefined || monthChanged) {
        // Get the current monthly budget
        const currentBudget = await findMonthlyBudgetById(transaction.monthlyBudgetId);
        if (!currentBudget) {
          throw new AppError("Monthly budget not found", 404);
        }

        // Reverse the effect of the original transaction on the current budget
        await this.monthlyBudgetService.updateRemainingBalance(
          currentBudget.id,
          originalAmount,
          originalType !== TransactionType.INCOME // If it was an expense, add it back
        );

        // If month changed, get or create the new monthly budget
        if (monthChanged) {
          const newYear = date!.getFullYear();
          const newMonth = date!.getMonth() + 1;
          const newBudget = await this.monthlyBudgetService.getOrCreateMonthlyBudget(
            transaction.clientId,
            newYear,
            newMonth
          );
          
          transaction.monthlyBudget = newBudget;
          transaction.monthlyBudgetId = newBudget.id;
          
          // Apply the new transaction to the new budget
          const newAmount = amount !== undefined ? amount : originalAmount;
          const newType = type !== undefined ? type : originalType;
          
          await this.monthlyBudgetService.updateRemainingBalance(
            newBudget.id,
            newAmount,
            newType === TransactionType.INCOME // If income, add to remaining balance
          );
          
          // Update remaining balance after transaction
          transaction.remainingBalanceAfterTransaction = newType === TransactionType.EXPENSE
            ? newBudget.remainingBalance - newAmount
            : newBudget.remainingBalance + newAmount;
        } else {
          // Apply the updated transaction to the current budget
          const newAmount = amount !== undefined ? amount : originalAmount;
          const newType = type !== undefined ? type : originalType;
          
          await this.monthlyBudgetService.updateRemainingBalance(
            currentBudget.id,
            newAmount,
            newType === TransactionType.INCOME // If income, add to remaining balance
          );
          
          // Update remaining balance after transaction
          transaction.remainingBalanceAfterTransaction = newType === TransactionType.EXPENSE
            ? currentBudget.remainingBalance - newAmount
            : currentBudget.remainingBalance + newAmount;
        }
        
        // Update amount if provided
        if (amount !== undefined) {
          transaction.amount = amount;
        }
      }

      // Save updated transaction
      return await updateDailyTransaction(transaction);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateDailyTransaction service for ID ${id}:`, error);
      throw new AppError("Failed to update daily transaction", 500);
    }
  }

  /**
   * Delete a daily transaction
   */
  public async deleteDailyTransaction(id: string): Promise<void> {
    try {
      // Get transaction
      const transaction = await this.getDailyTransactionById(id);
      
      // Get monthly budget
      const monthlyBudget = await findMonthlyBudgetById(transaction.monthlyBudgetId);
      if (!monthlyBudget) {
        throw new AppError("Monthly budget not found", 404);
      }
      
      // Reverse the effect of the transaction on the budget
      await this.monthlyBudgetService.updateRemainingBalance(
        monthlyBudget.id,
        transaction.amount,
        transaction.type !== TransactionType.INCOME // If it was an expense, add it back
      );
      
      // Delete transaction
      await deleteDailyTransaction(transaction);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in deleteDailyTransaction service for ID ${id}:`, error);
      throw new AppError("Failed to delete daily transaction", 500);
    }
  }

  /**
   * Get daily transactions sum by date
   */
  public async getDailyTransactionsSumByDate(clientId: string, date: Date): Promise<number> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      return await getDailyTransactionsSumByDate(clientId, date);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getDailyTransactionsSumByDate service for client ID ${clientId}, date ${date}:`, error);
      throw new AppError("Failed to get daily transactions sum", 500);
    }
  }

  /**
   * Get daily transactions sum by month
   */
  public async getDailyTransactionsSumByMonth(
    clientId: string,
    year: number,
    month: number
  ): Promise<number> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      return await getDailyTransactionsSumByMonth(clientId, year, month);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getDailyTransactionsSumByMonth service for client ID ${clientId}, month ${month}/${year}:`, error);
      throw new AppError("Failed to get daily transactions sum", 500);
    }
  }
}
