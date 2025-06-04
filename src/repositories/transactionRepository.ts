import { Between, FindOptionsWhere, IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Transaction, TransactionType } from "../entities/Transaction";
import { LoggerService } from "../services/LoggerService";

/**
 * Repository for Transaction entity
 */
const transactionRepository = AppDataSource.getRepository(Transaction);
const logger = LoggerService.getInstance();

/**
 * Find all transactions for a client with optional filters
 * @param clientId Client ID
 * @param filters Optional filters (startDate, endDate, type, categoryId)
 * @returns Array of transactions
 */
export const findAllTransactions = async (
  clientId: string, 
  filters?: { 
    startDate?: string; 
    endDate?: string; 
    type?: TransactionType; 
    categoryId?: string | 'null';
  }
): Promise<Transaction[]> => {
  try {
    // Build query conditions
    const whereConditions: FindOptionsWhere<Transaction> = { 
      client: { id: clientId } 
    };
    
    // Add date range filter if provided
    if (filters?.startDate && filters?.endDate) {
      whereConditions.date = Between(
        new Date(filters.startDate),
        new Date(filters.endDate)
      );
    }

    // Add transaction type filter if provided
    if (filters?.type && Object.values(TransactionType).includes(filters.type)) {
      whereConditions.type = filters.type;
    }

    // Add category filter if provided
    if (filters?.categoryId) {
      if (filters.categoryId === 'null') {
        whereConditions.category = IsNull();
      } else {
        whereConditions.category = { id: filters.categoryId };
      }
    }

    return await transactionRepository.find({
      where: whereConditions,
      relations: ["category"],
      order: { date: "DESC" }
    });
  } catch (error) {
    logger.error("Error finding all transactions:", error);
    throw error;
  }
};

/**
 * Find a transaction by ID for a specific client
 * @param id Transaction ID
 * @param clientId Client ID
 * @returns Transaction or null if not found
 */
export const findTransactionById = async (id: string, clientId: string): Promise<Transaction | null> => {
  try {
    return await transactionRepository.findOne({
      where: { 
        id,
        client: { id: clientId }
      },
      relations: ["category"]
    });
  } catch (error) {
    logger.error(`Error finding transaction with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new transaction
 * @param transactionData Transaction data
 * @returns Created transaction
 */
export const createTransaction = async (transactionData: Partial<Transaction>): Promise<Transaction> => {
  try {
    const transaction = transactionRepository.create(transactionData);
    return await transactionRepository.save(transaction);
  } catch (error) {
    logger.error("Error creating transaction:", error);
    throw error;
  }
};

/**
 * Update a transaction
 * @param transaction Transaction to update
 * @returns Updated transaction
 */
export const updateTransaction = async (transaction: Transaction): Promise<Transaction> => {
  try {
    return await transactionRepository.save(transaction);
  } catch (error) {
    logger.error(`Error updating transaction with ID ${transaction.id}:`, error);
    throw error;
  }
};

/**
 * Delete a transaction
 * @param transaction Transaction to delete
 * @returns Deleted transaction
 */
export const deleteTransaction = async (transaction: Transaction): Promise<Transaction> => {
  try {
    return await transactionRepository.remove(transaction);
  } catch (error) {
    logger.error(`Error deleting transaction with ID ${transaction.id}:`, error);
    throw error;
  }
};

/**
 * Get transactions summary for a client within a date range
 * @param clientId Client ID
 * @param startDate Start date
 * @param endDate End date
 * @returns Transactions within date range
 */
export const getTransactionsSummary = async (
  clientId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> => {
  try {
    return await transactionRepository.find({
      where: { 
        client: { id: clientId },
        date: Between(
          new Date(startDate),
          new Date(endDate)
        )
      },
      relations: ["category"]
    });
  } catch (error) {
    logger.error("Error getting transactions summary:", error);
    throw error;
  }
};

/**
 * Create a new transaction
 * @returns All transaction
 */
export const findAllTransaction = async (): Promise<Transaction[]> => {
  try {
    return await transactionRepository.find({
      relations:['client']
    });
  } catch (error) {
    logger.error("Error creating transaction:", error);
    throw error;
  }
};

export default transactionRepository;
