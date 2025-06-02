import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Client } from "../entities/Client";
import { Role, RoleType } from "../entities/Role";
import { Auth, AuthType } from "../entities/Auth";
import { Category } from "../entities/Category";
import { Transaction, TransactionType } from "../entities/Transaction";
import { MaritalStatus } from "../entities/Client";
import * as bcrypt from "bcryptjs";
import { LoggerService } from "./LoggerService";

/**
 * Service for common database operations
 */
export class DatabaseService {
    private static logger = LoggerService.getInstance();

    /**
     * Seed the database with initial data
     */
    static async seedDatabase(): Promise<void> {
        try {
            // Check if database is already seeded
            const userRepository = AppDataSource.getRepository(User);
            const existingUsers = await userRepository.count();

            if (existingUsers > 0) {
                this.logger.info("Database already seeded, skipping...");
                return;
            }

            this.logger.info("Seeding database with initial data...");

            // Create roles
            const roleRepository = AppDataSource.getRepository(Role);
            const adminRole = roleRepository.create({
                name: RoleType.ADMIN,
                description: "Administrator with full access"
            });
            const managerRole = roleRepository.create({
                name: RoleType.MANAGER,
                description: "Manager with client management access"
            });
            const clientRole = roleRepository.create({
                name: RoleType.CLIENT,
                description: "Client with limited access"
            });

            await roleRepository.save([adminRole, managerRole, clientRole]);
            this.logger.info("Roles created");

            // Create a demo admin user with hashed password
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const adminUser = userRepository.create({
                name: "Admin User",
                email: "admin@example.com",
                password: hashedPassword,
                role: adminRole
            });

            await userRepository.save(adminUser);
            this.logger.info("Admin user created");

            // Create a demo manager user
            const managerPassword = await bcrypt.hash("manager123", 10);
            const managerUser = userRepository.create({
                name: "Manager User",
                email: "manager@example.com",
                password: managerPassword,
                role: managerRole
            });

            await userRepository.save(managerUser);
            this.logger.info("Manager user created");

            // Create auth records for users
            const authRepository = AppDataSource.getRepository(Auth);
            const adminAuth = authRepository.create({
                email: adminUser.email,
                password: hashedPassword,
                type: AuthType.USER,
                userId: adminUser.id
            });

            const managerAuth = authRepository.create({
                email: managerUser.email,
                password: managerPassword,
                type: AuthType.USER,
                userId: managerUser.id
            });

            await authRepository.save([adminAuth, managerAuth]);
            this.logger.info("Auth records created for users");

            // Create a demo client
            const clientRepository = AppDataSource.getRepository(Client);
            const demoClient = clientRepository.create({
                name: "Demo Client",
                email: "client@example.com",
                cpf: "123.456.789-00",
                phone: "+1234567890",
                birthday: new Date(1990, 0, 1),
                age: 35,
                salary: 5000,
                address: "123 Main St",
                city: "Example City",
                state: "EX",
                zipCode: "12345-678",
                complement: "Apt 101",
                maritalStatus: MaritalStatus.SINGLE,
                manager: managerUser
            });

            await clientRepository.save(demoClient);
            this.logger.info("Demo client created");

            // Create auth record for client
            const clientPassword = await bcrypt.hash("client123", 10);
            const clientAuth = authRepository.create({
                email: demoClient.email,
                password: clientPassword,
                type: AuthType.CLIENT,
                clientId: demoClient.id
            });

            await authRepository.save(clientAuth);
            this.logger.info("Auth record created for client");

            // Create some categories
            const categoryRepository = AppDataSource.getRepository(Category);
            const categories = categoryRepository.create([
                {
                    name: "Food & Dining",
                    description: "Restaurants, groceries, etc.",
                    color: "#FF5733",
                    icon: "restaurant",
                    client: demoClient,
                    clientId: demoClient.id
                },
                {
                    name: "Transportation",
                    description: "Gas, public transit, etc.",
                    color: "#33A1FF",
                    icon: "directions_car",
                    client: demoClient,
                    clientId: demoClient.id
                },
                {
                    name: "Housing",
                    description: "Rent, mortgage, utilities, etc.",
                    color: "#33FF57",
                    icon: "home",
                    client: demoClient,
                    clientId: demoClient.id
                },
                {
                    name: "Entertainment",
                    description: "Movies, games, etc.",
                    color: "#D133FF",
                    icon: "movie",
                    client: demoClient,
                    clientId: demoClient.id
                },
                {
                    name: "Salary",
                    description: "Regular income",
                    color: "#33FFC1",
                    icon: "account_balance",
                    client: demoClient,
                    clientId: demoClient.id
                }
            ]);

            await categoryRepository.save(categories);
            this.logger.info("Demo categories created");

            // Create some transactions
            const transactionRepository = AppDataSource.getRepository(Transaction);
            
            // Current date for reference
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            const transactions = transactionRepository.create([
                {
                    description: "Monthly Salary",
                    amount: 3000,
                    type: TransactionType.INCOME,
                    date: new Date(currentYear, currentMonth, 1),
                    client: demoClient,
                    clientId: demoClient.id,
                    category: categories[4], // Salary
                    categoryId: categories[4].id
                },
                {
                    description: "Rent",
                    amount: 1200,
                    type: TransactionType.EXPENSE,
                    date: new Date(currentYear, currentMonth, 5),
                    client: demoClient,
                    clientId: demoClient.id,
                    category: categories[2], // Housing
                    categoryId: categories[2].id
                },
                {
                    description: "Grocery Shopping",
                    amount: 150,
                    type: TransactionType.EXPENSE,
                    date: new Date(currentYear, currentMonth, 10),
                    client: demoClient,
                    clientId: demoClient.id,
                    category: categories[0], // Food & Dining
                    categoryId: categories[0].id
                },
                {
                    description: "Gas",
                    amount: 50,
                    type: TransactionType.EXPENSE,
                    date: new Date(currentYear, currentMonth, 15),
                    client: demoClient,
                    clientId: demoClient.id,
                    category: categories[1], // Transportation
                    categoryId: categories[1].id
                },
                {
                    description: "Movie Night",
                    amount: 30,
                    type: TransactionType.EXPENSE,
                    date: new Date(currentYear, currentMonth, 20),
                    client: demoClient,
                    clientId: demoClient.id,
                    category: categories[3], // Entertainment
                    categoryId: categories[3].id
                },
                {
                    description: "Freelance Work",
                    amount: 500,
                    type: TransactionType.INCOME,
                    date: new Date(currentYear, currentMonth, 25),
                    client: demoClient,
                    clientId: demoClient.id,
                    category: categories[4], // Salary
                    categoryId: categories[4].id
                }
            ]);

            await transactionRepository.save(transactions);
            this.logger.info("Demo transactions created");

            this.logger.info("Database seeding completed successfully");
        } catch (error) {
            this.logger.error("Error seeding database:", error);
            throw error;
        }
    }
}
