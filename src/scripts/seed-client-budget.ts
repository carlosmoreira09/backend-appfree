import { AppDataSource } from "../data-source";
import { Client } from "../entities/Client";
import { MonthlyBudget } from "../entities/MonthlyBudget";
import { DailyTransaction, TransactionType } from "../entities/DailyTransaction";
import { Category } from "../entities/Category";
import { LoggerService } from "../services/LoggerService";

const logger = LoggerService.getInstance();

async function seedClientBudget() {
  try {
    // Initialize data source
    await AppDataSource.initialize();
    logger.info("Data source initialized");

    // Get repositories
    const clientRepository = AppDataSource.getRepository(Client);
    const categoryRepository = AppDataSource.getRepository(Category);
    const monthlyBudgetRepository = AppDataSource.getRepository(MonthlyBudget);
    const dailyTransactionRepository = AppDataSource.getRepository(DailyTransaction);

    // Get demo client
    const demoClient = await clientRepository.findOne({
      where: { email: "client@example.com" }
    });

    if (!demoClient) {
      logger.error("Demo client not found");
      return;
    }

    // Get categories
    const categories = await categoryRepository.find({
      where: { clientId: demoClient.id }
    });

    if (categories.length === 0) {
      logger.error("No categories found for demo client");
      return;
    }

    // Current date for reference
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Create a monthly budget for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const actualBudgetAmount = demoClient.salary * 0.6;
    const dailyBudget = actualBudgetAmount / daysInMonth;
    
    // Check if monthly budget already exists
    let monthlyBudget = await monthlyBudgetRepository.findOne({
      where: {
        clientId: demoClient.id,
        year: currentYear,
        month: currentMonth + 1
      }
    });

    if (!monthlyBudget) {
      monthlyBudget = monthlyBudgetRepository.create({
        year: currentYear,
        month: currentMonth + 1, // JavaScript months are 0-indexed
        monthlySalary: demoClient.salary,
        budgetAmount: 60, // 60%
        isPercentage: true,
        dailyBudget: dailyBudget,
        remainingBalance: actualBudgetAmount,
        daysInMonth: daysInMonth,
        client: demoClient,
        clientId: demoClient.id
      });

      await monthlyBudgetRepository.save(monthlyBudget);
      logger.info("Demo monthly budget created");
    } else {
      logger.info("Monthly budget already exists, skipping creation");
    }

    // Create some daily transactions
    const existingTransactions = await dailyTransactionRepository.find({
      where: {
        clientId: demoClient.id,
        monthlyBudgetId: monthlyBudget.id
      }
    });

    if (existingTransactions.length === 0) {
      let remainingBalance = actualBudgetAmount;
      
      const dailyTransactions = [
        {
          description: "Lunch",
          amount: 15,
          type: TransactionType.EXPENSE,
          date: new Date(currentYear, currentMonth, now.getDate()),
          remainingBalanceAfterTransaction: remainingBalance - 15,
          client: demoClient,
          clientId: demoClient.id,
          category: categories[0], // Food & Dining
          categoryId: categories[0].id,
          monthlyBudget: monthlyBudget,
          monthlyBudgetId: monthlyBudget.id
        },
        {
          description: "Coffee",
          amount: 5,
          type: TransactionType.EXPENSE,
          date: new Date(currentYear, currentMonth, now.getDate()),
          remainingBalanceAfterTransaction: remainingBalance - 15 - 5,
          client: demoClient,
          clientId: demoClient.id,
          category: categories[0], // Food & Dining
          categoryId: categories[0].id,
          monthlyBudget: monthlyBudget,
          monthlyBudgetId: monthlyBudget.id
        },
        {
          description: "Bus Fare",
          amount: 3,
          type: TransactionType.EXPENSE,
          date: new Date(currentYear, currentMonth, now.getDate()),
          remainingBalanceAfterTransaction: remainingBalance - 15 - 5 - 3,
          client: demoClient,
          clientId: demoClient.id,
          category: categories[1], // Transportation
          categoryId: categories[1].id,
          monthlyBudget: monthlyBudget,
          monthlyBudgetId: monthlyBudget.id
        }
      ];

      await dailyTransactionRepository.save(dailyTransactions);
      logger.info("Demo daily transactions created");

      // Update monthly budget remaining balance
      monthlyBudget.remainingBalance = remainingBalance - 15 - 5 - 3;
      await monthlyBudgetRepository.save(monthlyBudget);
    } else {
      logger.info("Daily transactions already exist, skipping creation");
    }

    // Close connection
    await AppDataSource.destroy();
    logger.info("Connection closed");
    logger.info("Client budget seeding completed successfully");
  } catch (error) {
    logger.error("Error seeding client budget:", error);
    process.exit(1);
  }
}

seedClientBudget()
  .then(() => {
    logger.info("Client budget seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
  });
