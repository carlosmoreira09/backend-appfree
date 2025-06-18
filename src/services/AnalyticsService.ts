import { AppDataSource } from "../config/data-source";
import { DailyTransaction } from "../entities/DailyTransaction";
import { Category } from "../entities/Category";
import { AppError } from "../middlewares";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { LoggerService } from "./LoggerService";

interface CategorySpending {
    categoryId: string;
    categoryName: string;
    amount: number;
}

interface DailySpendingData {
    date: string;
    income: number;
    expense: number;
    balance: number;
}

interface MonthlyBalanceData {
    month: string;
    income: number;
    expense: number;
    balance: number;
}

export class AnalyticsService {
    private logger = LoggerService.getInstance();
    private dailyTransactionRepository = AppDataSource.getRepository(DailyTransaction);
    private categoryRepository = AppDataSource.getRepository(Category);

    /**
     * Get spending by category for a client
     * @param clientId The client ID
     * @returns Array of category spending data
     */
    async getCategorySpending(clientId: string): Promise<CategorySpending[]> {
        try {
            // Verify client exists
            const transactions = await this.dailyTransactionRepository.find({
                where: { client: { id: clientId } },
                relations: ["category"],
            });

            if (!transactions.length) {
                return [];
            }

            // Group transactions by category and calculate total amount
            const categoryMap = new Map<string, CategorySpending>();

            transactions.forEach(transaction => {
                if (!transaction.category) return;
                
                const categoryId = transaction.category.id;
                const amount = parseFloat(transaction.amount.toString());
                
                if (!categoryMap.has(categoryId)) {
                    categoryMap.set(categoryId, {
                        categoryId,
                        categoryName: transaction.category.name,
                        amount: transaction.type === 'expense' ? amount : 0
                    });
                } else {
                    const current = categoryMap.get(categoryId)!;
                    if (transaction.type === 'expense') {
                        current.amount += amount;
                    }
                    categoryMap.set(categoryId, current);
                }
            });

            // Convert map to array and sort by amount (descending)
            return Array.from(categoryMap.values())
                .sort((a, b) => b.amount - a.amount);
        } catch (error) {
            this.logger.error("Error in getCategorySpending:", error);
            throw new AppError("Failed to get category spending data", 500);
        }
    }

    /**
     * Get daily spending trend for a client
     * @param clientId The client ID
     * @param days Number of days to include (default: 7)
     * @returns Array of daily spending data
     */
    async getDailySpendingTrend(clientId: string, days: number = 7): Promise<DailySpendingData[]> {
        try {
            // Calculate date range
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (days - 1));
            startDate.setHours(0, 0, 0, 0);
            
            // Get transactions within date range
            const transactions = await this.dailyTransactionRepository.find({
                where: {
                    client: { id: clientId },
                    date: Between(startDate, endDate)
                }
            });

            // Generate daily data for each day in the range
            const dailyDataMap = new Map<string, DailySpendingData>();
            
            // Initialize map with all dates in range
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                
                dailyDataMap.set(dateStr, {
                    date: dateStr,
                    income: 0,
                    expense: 0,
                    balance: 0
                });
            }
            
            // Populate with transaction data
            transactions.forEach(transaction => {
                const dateStr = new Date(transaction.date).toISOString().split('T')[0];
                const amount = parseFloat(transaction.amount.toString());
                
                if (dailyDataMap.has(dateStr)) {
                    const dailyData = dailyDataMap.get(dateStr)!;
                    
                    if (transaction.type === 'income') {
                        dailyData.income += amount;
                    } else if (transaction.type === 'expense') {
                        dailyData.expense += amount;
                    }
                    
                    dailyData.balance = dailyData.income - dailyData.expense;
                    dailyDataMap.set(dateStr, dailyData);
                }
            });
            
            // Convert map to array and sort by date
            return Array.from(dailyDataMap.values())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } catch (error) {
            this.logger.error("Error in getDailySpendingTrend:", error);
            throw new AppError("Failed to get daily spending trend data", 500);
        }
    }

    /**
     * Get monthly balance data for a client
     * @param clientId The client ID
     * @param months Number of months to include (default: 6)
     * @returns Array of monthly balance data
     */
    async getMonthlyBalance(clientId: string, months: number = 6): Promise<MonthlyBalanceData[]> {
        try {
            // Calculate date range
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - (months - 1));
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            
            // Get transactions within date range
            const transactions = await this.dailyTransactionRepository.find({
                where: {
                    client: { id: clientId },
                    date: Between(startDate, endDate)
                }
            });

            // Generate monthly data for each month in the range
            const monthlyDataMap = new Map<string, MonthlyBalanceData>();
            
            // Initialize map with all months in range
            for (let i = 0; i < months; i++) {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);
                const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                monthlyDataMap.set(monthStr, {
                    month: monthStr,
                    income: 0,
                    expense: 0,
                    balance: 0
                });
            }
            
            // Populate with transaction data
            transactions.forEach(transaction => {
                const date = new Date(transaction.date);
                const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const amount = parseFloat(transaction.amount.toString());
                
                if (monthlyDataMap.has(monthStr)) {
                    const monthlyData = monthlyDataMap.get(monthStr)!;
                    
                    if (transaction.type === 'income') {
                        monthlyData.income += amount;
                    } else if (transaction.type === 'expense') {
                        monthlyData.expense += amount;
                    }
                    
                    monthlyData.balance = monthlyData.income - monthlyData.expense;
                    monthlyDataMap.set(monthStr, monthlyData);
                }
            });
            
            // Convert map to array and sort by month
            return Array.from(monthlyDataMap.values())
                .sort((a, b) => a.month.localeCompare(b.month));
        } catch (error) {
            this.logger.error("Error in getMonthlyBalance:", error);
            throw new AppError("Failed to get monthly balance data", 500);
        }
    }
}
