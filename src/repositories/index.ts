import userRepository, * as userRepo from './userRepository';
import categoryRepository, * as categoryRepo from './categoryRepository';
import transactionRepository, * as transactionRepo from './transactionRepository';
import clientRepository, * as clientRepo from './clientRepository';
import roleRepository, * as roleRepo from './roleRepository';
import authRepository, * as authRepo from './authRepository';
import monthlyBudgetRepository, * as monthlyBudgetRepo from './monthlyBudgetRepository';
import dailyTransactionRepository, * as dailyTransactionRepo from './dailyTransactionRepository';

// Export repositories
export {
  userRepository,
  categoryRepository,
  transactionRepository,
  clientRepository,
  roleRepository,
  authRepository,
  monthlyBudgetRepository,
  dailyTransactionRepository
};

// Export user repository functions
export const {
  findAllUsers,
  findUserById,
  findUserByIdWithPassword,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser
} = userRepo;

// Export category repository functions
export const {
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = categoryRepo;

// Export transaction repository functions
export const {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary
} = transactionRepo;

// Export client repository functions
export const {
  findAllClients,
  findAllClientsPaginated,
  findClientsByManager,
  findClientsByManagerPaginated,
  findClientById,
  findClientByEmail,
  findClientByCpf,
  createClient,
  updateClient,
  deleteClient
} = clientRepo;

// Export role repository functions
export const {
  findAllRoles,
  findRoleById,
  findRoleByName,
  createRole,
  updateRole,
  deleteRole
} = roleRepo;

// Export auth repository functions
export const {
  findAllAuth,
  findAuthById,
  findAuthByEmail,
  findAuthByUserId,
  findAuthByClientId,
  createAuth,
  updateAuth,
  deleteAuth,
  updateLastLogin
} = authRepo;

// Export monthly budget repository functions
export const {
  findMonthlyBudgetsByClient,
  findMonthlyBudgetById,
  findMonthlyBudgetByYearAndMonth,
  createMonthlyBudget,
  updateMonthlyBudget,
  deleteMonthlyBudget
} = monthlyBudgetRepo;

// Export daily transaction repository functions
export const {
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
  findAllDailyTransaction
} = dailyTransactionRepo;
