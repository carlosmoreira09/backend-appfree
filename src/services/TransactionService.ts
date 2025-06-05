import { Transaction, TransactionType } from "../entities/Transaction";
import { AppError } from "../middlewares";
import { LoggerService } from "./LoggerService";
import {
  findClientById,
  findCategoryById,
  findAllTransactions,
  findTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary
} from "../repositories";

export class TransactionService {
  private logger = LoggerService.getInstance();

  /**
   * Get all transactions for a client with optional filters
   */
  public async getAllTransactions(
    clientId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      type?: TransactionType;
      categoryId?: string | 'null';
    }
  ): Promise<Transaction[]> {
    try {
      // Validate client exists
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      // Get transactions with filters
      return await findAllTransactions(clientId, filters);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in getAllTransactions service:", error);
      throw new AppError("Failed to get transactions", 500);
    }
  }

  /**
   * Get a transaction by ID
   */
  public async getTransactionById(id: string, clientId: string): Promise<Transaction> {
    try {
      const transaction = await findTransactionById(id, clientId);
      if (!transaction) {
        throw new AppError("Transaction not found", 404);
      }
      return transaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getTransactionById service for ID ${id}:`, error);
      throw new AppError("Failed to get transaction", 500);
    }
  }

  /**
   * Create a new transaction
   */
  public async createTransaction(
    clientId: string,
    transactionData: {
      description: string;
      amount: number;
      type?: TransactionType;
      date: string;
      categoryId?: string;
    }
  ): Promise<Transaction> {
    try {
      const { description, amount, type, date, categoryId } = transactionData;

      // Find client
      const client = await findClientById(clientId);
      if (!client) {
        throw new AppError("Client not found", 404);
      }

      // Create transaction object
      const newTransaction: Partial<Transaction> = {
        description,
        amount,
        type: type || TransactionType.EXPENSE,
        date: new Date(date),
        client,
        clientId
      };

      // Add category if provided and not null
      if (categoryId) {
        const category = await findCategoryById(categoryId);
        if (!category) {
          throw new AppError("Category not found", 404);
        }
        newTransaction.categoryId = categoryId;
      }

      // Save transaction
      return await createTransaction(newTransaction);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in createTransaction service:", error);
      throw new AppError("Failed to create transaction", 500);
    }
  }

  /**
   * Update a transaction
   */
  public async updateTransaction(
    id: string,
    clientId: string,
    updateData: {
      description?: string;
      amount?: number;
      type?: TransactionType;
      date?: string;
      categoryId?: string | null;
    }
  ): Promise<Transaction> {
    try {
      const { description, amount, type, date, categoryId } = updateData;

      // Find transaction
      const transaction = await this.getTransactionById(id, clientId);

      // Update transaction properties
      if (description !== undefined) transaction.description = description;
      if (amount !== undefined) transaction.amount = amount;
      if (type !== undefined) transaction.type = type;
      if (date !== undefined) transaction.date = new Date(date);

      // Update category if provided
      if (categoryId) {
          // Find and set new category
          const category = await findCategoryById(categoryId);
          if (!category) {
            throw new AppError("Category not found", 404);
          }
          transaction.categoryId = categoryId;
        }

      // Save updated transaction
      return await updateTransaction(transaction);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateTransaction service for ID ${id}:`, error);
      throw new AppError("Failed to update transaction", 500);
    }
  }

  /**
   * Delete a transaction
   */
  public async deleteTransaction(id: string, clientId: string): Promise<void> {
    try {
      // Find transaction
      const transaction = await this.getTransactionById(id, clientId);

      // Delete transaction
      await deleteTransaction(transaction);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in deleteTransaction service for ID ${id}:`, error);
      throw new AppError("Failed to delete transaction", 500);
    }
  }

}
