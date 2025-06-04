import { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { MaritalStatus } from "../entities/Client";
import {findAllDailyTransaction} from "../repositories";
import {AuthService, ClientService, LoggerService} from "../services";
import {AppError} from "../middlewares";

export class ClientController {
    private logger = LoggerService.getInstance();
    private clientService = new ClientService();
    private authService = new AuthService();

    /**
     * Validation rules for creating/updating clients
     */
    clientUpdateValidation = [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("cpf")
            .notEmpty().withMessage("CPF is required")
            .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage("CPF must be in format 000.000.000-00"),
        body("phone")
            .optional()
            .isMobilePhone("any").withMessage("Valid phone number is required"),
        body("birthday")
            .optional()
            .isISO8601().withMessage("Birthday must be a valid date in ISO 8601 format"),
        body("age")
            .optional()
            .isInt({ min: 0 }).withMessage("Age must be a positive integer"),
        body("salary")
            .optional()
            .isFloat({ min: 0 }).withMessage("Salary must be a positive number"),
        body("address")
            .optional()
            .isString().withMessage("Address must be a string"),
        body("city")
            .optional()
            .isString().withMessage("City must be a string"),
        body("state")
            .optional()
            .isString().withMessage("State must be a string"),
        body("zipCode")
            .optional()
            .isString().withMessage("Zip code must be a string"),
        body("complement")
            .optional()
            .isString().withMessage("Complement must be a string"),
        body("maritalStatus")
            .optional()
            .isIn(Object.values(MaritalStatus)).withMessage("Invalid marital status"),
    ];
    clientValidation = [
        ...this.clientUpdateValidation,
        body("password")
            .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
            .optional(),
    ];

    /**
     * Validation rules for client ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid client ID format")
    ];

    /**
     * Validation rules for listing clients
     */
    listValidation = [
        query("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        query("search")
            .optional()
            .isString().withMessage("Search must be a string"),
        query("sortBy")
            .optional()
            .isIn(["name", "email", "createdAt"]).withMessage("Invalid sort field"),
        query("sortOrder")
            .optional()
            .isIn(["ASC", "DESC"]).withMessage("Sort order must be ASC or DESC")
    ];

    /**
     * Get all clients with pagination, filtering, and sorting
     */
    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Parse query parameters
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            const search = req.query.search as string | undefined;
            const sortBy = req.query.sortBy as string || "name";
            const sortOrder = req.query.sortOrder as "ASC" | "DESC" || "ASC";
            const isActive = req.query.isActive === "true" ? true : 
                             req.query.isActive === "false" ? false : undefined;

            // Check if user is requesting their managed clients
            if (req.query.managed === 'true' && req.userId) {
                const { clients, total } = await this.clientService.getClientsByManagerPaginated(
                    req.userId,
                    page,
                    limit,
                    search,
                    sortBy,
                    sortOrder,
                    isActive
                );
                
                return res.status(200).json({
                    clients,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                });
            }
            
            // Otherwise return all clients (admin only)
            const { clients, total } = await this.clientService.getAllClientsPaginated(
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                isActive
            );
            
            return res.status(200).json({
                clients,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching clients:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get a client by ID
     */
    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const client = await this.clientService.getClientById(id);
            
            // Check if user is authorized to view this client
            if (req.userId && client.managerId !== req.userId) {
                // Allow if client is accessing their own data
                if (!(req.clientId && req.clientId === id)) {
                    return res.status(403).json({ message: "You are not authorized to view this client" });
                }
            }
            
            return res.status(200).json(client);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Create a new client with authentication
     */
    registerClient = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                name,
                email,
                cpf,
                phone,
                birthday,
                age,
                salary,
                address,
                city,
                state,
                zipCode,
                complement,
                maritalStatus,
                password,
                managerId
            } = req.body;

            // Password is required for registration
            if (!password) {
                return res.status(400).json({ message: "Password is required for client registration" });
            }

            // Use authenticated user as manager if not specified
            const effectiveManagerId = managerId || req.userId;
            if (!effectiveManagerId) {
                return res.status(400).json({ message: "Manager ID is required" });
            }

            // Create client
            const client = await this.clientService.createClient({
                name,
                email,
                cpf,
                phone,
                birthday,
                age,
                salary,
                address,
                city,
                state,
                zipCode,
                complement,
                maritalStatus,
                managerId: effectiveManagerId
            });

            // Register client for authentication
            await this.authService.registerClient(client, password);

            return res.status(201).json({
                message: "Client registered successfully",
                client
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error registering client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Create a new client
     */
    create = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            console.log(errors)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                name,
                email,
                cpf,
                phone,
                birthday,
                age,
                salary,
                address,
                city,
                state,
                zipCode,
                complement,
                maritalStatus,
                password,
            } = req.body;

            // Use authenticated user as manager if not specified
            const effectiveManagerId = req.userId;
            if (!effectiveManagerId) {
                return res.status(400).json({ message: "Manager ID is required" });
            }

            // Create client
            const client = await this.clientService.createClient({
                name,
                email,
                cpf,
                phone,
                birthday,
                age,
                salary,
                address,
                city,
                state,
                zipCode,
                complement,
                maritalStatus,
                managerId: effectiveManagerId
            });

            // Register client for authentication if password provided
            if (password) {
                await this.authService.registerClient(client, password);
            }

            return res.status(201).json(client);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error creating client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update a client
     */
    update = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const {
                name,
                email,
                cpf,
                phone,
                birthday,
                age,
                salary,
                address,
                city,
                state,
                zipCode,
                complement,
                maritalStatus,
                isActive,
                managerId,
                password
            } = req.body;

            // Get current client
            const currentClient = await this.clientService.getClientById(id);
            
            // Check if user is authorized to update this client
            if (req.userId && currentClient.managerId !== req.userId) {
                // Allow if client is updating their own data
                if (!(req.clientId && req.clientId === id)) {
                    return res.status(403).json({ message: "You are not authorized to update this client" });
                }
                
                // Clients can't update certain fields
                if (req.clientId && (managerId || isActive !== undefined)) {
                    return res.status(403).json({ message: "You are not authorized to update these fields" });
                }
            }

            // Update client
            const client = await this.clientService.updateClient(id, {
                name,
                email,
                cpf,
                phone,
                birthday,
                age,
                salary,
                address,
                city,
                state,
                zipCode,
                complement,
                maritalStatus,
                isActive,
                managerId,
                password
            });

            return res.status(200).json({
                message: "Client updated successfully",
                client
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Deactivate a client
     */
    deactivate = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            
            // Get current client
            const currentClient = await this.clientService.getClientById(id);
            
            // Check if user is authorized to deactivate this client
            if (req.userId && currentClient.managerId !== req.userId) {
                return res.status(403).json({ message: "You are not authorized to deactivate this client" });
            }

            // Deactivate client
            const client = await this.clientService.updateClient(id, { isActive: false });

            return res.status(200).json({
                message: "Client deactivated successfully",
                client
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deactivating client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Delete a client
     */
    delete = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            
            // Get current client
            const currentClient = await this.clientService.getClientById(id);
            
            // Check if user is authorized to delete this client
            if (req.userId && currentClient.managerId !== req.userId) {
                return res.status(403).json({ message: "You are not authorized to delete this client" });
            }

            // Delete client
            await this.clientService.deleteClient(id);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deleting client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get dashboard stats for admin
     * - Total clients
     * - Active clients
     * - System status
     * - Last login date
     */
    getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Get total clients count
            const { clients: allClients, total: totalClients } = await this.clientService.getAllClientsPaginated(1, 1);
            
            // Get active clients count
            const { total: activeClients } = await this.clientService.getAllClientsPaginated(1, 1, undefined, undefined, undefined, true);
            
            // For now, hardcode some values that would normally come from other services
            const lastLoginDate = new Date().toISOString(); // Would normally come from auth service
            
            return res.status(200).json({ data:
                allClients,
                totalClients,
                activeClients,
                lastLoginDate
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching dashboard stats:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Get recent client activities
     * Based on recent transactions
     */
    getRecentActivities = async (req: Request, res: Response): Promise<Response> => {
        try {

            // Get all clients first (limited to improve performance)
            const transactions = await findAllDailyTransaction();

            const limitedActivities = transactions.slice(0, 10);
            return res.status(200).json(limitedActivities);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching recent activities:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}
