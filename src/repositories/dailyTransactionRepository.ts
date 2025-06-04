import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../data-source";
import { DailyTransaction } from "../entities/DailyTransaction";
import { LoggerService } from "../services";

/**
 * Repository for DailyTransaction entity
 */
const dailyTransactionRepository = AppDataSource.getRepository(DailyTransaction);
const logger = LoggerService.getInstance();

/**
 * Find all daily transactions for a client
 * @param clientId Client ID
 * @returns Array of daily transactions
 */
export const findDailyTransactionsByClient = async (clientId: string): Promise<DailyTransaction[]> => {
  try {
    return await dailyTransactionRepository.find({
      where: { clientId },
      relations: ["category", "monthlyBudget"],
      order: { date: "DESC", createdAt: "DESC" }
    });
  } catch (error) {
    logger.error(`Error finding daily transactions for client ${clientId}:`, error);
    throw error;
  }
};
/**
 * Find all daily transactions for a client by date
 * @returns Array of daily transactions
 */
export const findAllDailyTransaction= async () => {
  try {
    return await dailyTransactionRepository.find({
      relations: ["category", "monthlyBudget", 'client'],
      order: {date: "ASC", createdAt: "ASC"}
    });
  } catch (error) {
    logger.error(`Error finding daily transactions:`, error);
    throw error;
  }
}

/**
 * Find daily transactions for a client by date
 * @param clientId Client ID
 * @param date Date
 * @returns Array of daily transactions
 */
export const findDailyTransactionsByDate = async (clientId: string, date: Date): Promise<DailyTransaction[]> => {
  try {
    return await dailyTransactionRepository.find({
      where: { clientId, date },
      relations: ["category", "monthlyBudget"],
      order: { createdAt: "DESC" }
    });
  } catch (error) {
    logger.error(`Error finding daily transactions for client ${clientId} on date ${date}:`, error);
    throw error;
  }
};

/**
 * Find daily transactions for a client by month
 * @param clientId Client ID
 * @param year Year
 * @param month Month
 * @returns Array of daily transactions
 */
export const findDailyTransactionsByMonth = async (
  clientId: string,
  year: number,
  month: number
): Promise<DailyTransaction[]> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await dailyTransactionRepository.find({
      where: {
        clientId,
        date: Between(startDate, endDate)
      },
      relations: ["category", "monthlyBudget"],
      order: { date: "ASC", createdAt: "DESC" }
    });
  } catch (error) {
    logger.error(`Error finding daily transactions for client ${clientId} in month ${month}/${year}:`, error);
    throw error;
  }
};

/**
 * Find daily transactions for a monthly budget
 * @param monthlyBudgetId Monthly budget ID
 * @returns Array of daily transactions
 */
export const findDailyTransactionsByMonthlyBudget = async (monthlyBudgetId: string): Promise<DailyTransaction[]> => {
  try {
    return await dailyTransactionRepository.find({
      where: { monthlyBudgetId },
      relations: ["category", "monthlyBudget"],
      order: { date: "ASC", createdAt: "DESC" }
    });
  } catch (error) {
    logger.error(`Error finding daily transactions for monthly budget ${monthlyBudgetId}:`, error);
    throw error;
  }
};

/**
 * Find a daily transaction by ID
 * @param id Daily transaction ID
 * @returns Daily transaction or null if not found
 */
export const findDailyTransactionById = async (id: string): Promise<DailyTransaction | null> => {
  try {
    return await dailyTransactionRepository.findOne({
      where: { id },
      relations: ["category", "monthlyBudget", "client"]
    });
  } catch (error) {
    logger.error(`Error finding daily transaction with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new daily transaction
 * @param transactionData Daily transaction data
 * @returns Created daily transaction
 */
export const createDailyTransaction = async (transactionData: Partial<DailyTransaction>): Promise<DailyTransaction> => {
  try {
    const transaction = dailyTransactionRepository.create(transactionData);
    return await dailyTransactionRepository.save(transaction);
  } catch (error) {
    logger.error("Error creating daily transaction:", error);
    throw error;
  }
};

/**
 * Update a daily transaction
 * @param transaction Daily transaction to update
 * @returns Updated daily transaction
 */
export const updateDailyTransaction = async (transaction: DailyTransaction): Promise<DailyTransaction> => {
  try {
    return await dailyTransactionRepository.save(transaction);
  } catch (error) {
    logger.error(`Error updating daily transaction with ID ${transaction.id}:`, error);
    throw error;
  }
};

/**
 * Delete a daily transaction
 * @param transaction Daily transaction to delete
 * @returns Deleted daily transaction
 */
export const deleteDailyTransaction = async (transaction: DailyTransaction): Promise<DailyTransaction> => {
  try {
    return await dailyTransactionRepository.remove(transaction);
  } catch (error) {
    logger.error(`Error deleting daily transaction with ID ${transaction.id}:`, error);
    throw error;
  }
};

/**
 * Get the sum of daily transactions for a specific date
 * @param clientId Client ID
 * @param date Date
 * @returns Sum of daily transactions
 */
export const getDailyTransactionsSumByDate = async (
  clientId: string,
  date: Date
): Promise<number> => {
  try {
    const result = await dailyTransactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.clientId = :clientId", { clientId })
      .andWhere("transaction.date = :date", { date })
      .andWhere("transaction.type = 'expense'")
      .getRawOne();
    
    return result.total ? parseFloat(result.total) : 0;
  } catch (error) {
    logger.error(`Error getting daily transactions sum for client ${clientId} on date ${date}:`, error);
    throw error;
  }
};

/**
 * Get the sum of daily transactions for a specific month
 * @param clientId Client ID
 * @param year Year
 * @param month Month
 * @returns Sum of daily transactions
 */
export const getDailyTransactionsSumByMonth = async (
  clientId: string,
  year: number,
  month: number
): Promise<number> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const result = await dailyTransactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "total")
      .where("transaction.clientId = :clientId", { clientId })
      .andWhere("transaction.date BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("transaction.type = 'expense'")
      .getRawOne();
    
    return result.total ? parseFloat(result.total) : 0;
  } catch (error) {
    logger.error(`Error getting daily transactions sum for client ${clientId} in month ${month}/${year}:`, error);
    throw error;
  }
};

export default dailyTransactionRepository;
