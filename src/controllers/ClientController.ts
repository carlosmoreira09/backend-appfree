import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "../services/LoggerService";
import { ClientService } from "../services/ClientService";
import { AuthService } from "../services/AuthService";
import { MaritalStatus } from "../entities/Client";

export class ClientController {
    private logger = LoggerService.getInstance();
    private clientService = new ClientService();
    private authService = new AuthService();

    /**
     * Validation rules for creating/updating clients
     */
    clientValidation = [
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
        body("password")
            .optional()
            .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
        body("managerId")
            .optional()
            .isUUID().withMessage("Manager ID must be a valid UUID")
    ];

    /**
     * Validation rules for client ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid client ID format")
    ];

    /**
     * Get all clients
     */
    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check if user is requesting their managed clients
            if (req.query.managed === 'true' && req.userId) {
                const clients = await this.clientService.getClientsByManager(req.userId);
                return res.status(200).json(clients);
            }
            
            // Otherwise return all clients (admin only)
            const clients = await this.clientService.getAllClients();
            return res.status(200).json(clients);
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
     * Create a new client
     */
    create = async (req: Request, res: Response): Promise<Response> => {
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
                managerId
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
                managerId
            });

            return res.status(200).json(client);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating client:", error);
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
}
