import userRepository, * as userRepo from './userRepository';
import categoryRepository, * as categoryRepo from './categoryRepository';
import transactionRepository, * as transactionRepo from './transactionRepository';
import clientRepository, * as clientRepo from './clientRepository';
import roleRepository, * as roleRepo from './roleRepository';
import authRepository, * as authRepo from './authRepository';

// Export repositories
export {
  userRepository,
  categoryRepository,
  transactionRepository,
  clientRepository,
  roleRepository,
  authRepository
};

// Export user repository functions
export const {
  findAllUsers,
  findUserById,
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
  findClientsByManager,
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
