import { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { TransactionType } from "../entities/DailyTransaction";
import {DailyTransactionService, LoggerService} from "../services";
import {AppError} from "../middlewares";

export class DailyTransactionController {
    private logger = LoggerService.getInstance();
    private dailyTransactionService = new DailyTransactionService();

    /**
     * Validation rules for daily transaction ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid daily transaction ID format")
    ];
    /**
     * Validation rules for client ID
     */
    clientIdValidation = [
        param("clientId").isUUID().withMessage("Invalid client ID format")
    ];
    /**
     * Validation rules for creating/updating daily transactions
     */
    transactionValidation = [
        body("description")
            .notEmpty()
            .withMessage("Description is required"),
        body("amount")
            .isFloat({ min: 0.01 })
            .withMessage("Amount must be a positive number"),
        body("type")
            .isIn(Object.values(TransactionType))
            .withMessage("Invalid transaction type"),
        body("date")
            .isISO8601()
            .withMessage("Date must be a valid date in ISO 8601 format"),
        body("categoryId")
            .optional()
            .isUUID()
            .withMessage("Category ID must be a valid UUID")
    ];

    /**
     * Validation rules for date
     */
    dateValidation = [
        param("date")
            .isISO8601()
            .withMessage("Date must be a valid date in ISO 8601 format")
    ];

    /**
     * Validation rules for year and month
     */
    yearMonthValidation = [
        param("year")
            .isInt({ min: 2000, max: 2100 })
            .withMessage("Year must be a valid year between 2000 and 2100"),
        param("month")
            .isInt({ min: 1, max: 12 })
            .withMessage("Month must be a valid month between 1 and 12")
    ];

    /**
     * Get all daily transactions for the authenticated client
     */
    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const { transactions, total } = await this.dailyTransactionService.getDailyTransactionsByClient(req.clientId, page, limit);
            return res.status(200).json({
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }});
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily transactions:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get daily transactions for a specific date
     */
    getByDate = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can access their daily transactions" });
            }

            const date = new Date(req.params.date);
            const transactions = await this.dailyTransactionService.getDailyTransactionsByDate(req.clientId, date);
            
            return res.status(200).json(transactions);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily transactions by date:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get daily transactions for a specific month
     */
    getByMonth = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can access their daily transactions" });
            }

            const year = parseInt(req.params.year);
            const month = parseInt(req.params.month);
            
            const transactions = await this.dailyTransactionService.getDailyTransactionsByMonth(req.clientId, year, month);
            
            return res.status(200).json(transactions);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily transactions by month:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get a daily transaction by ID
     */
    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can access their daily transactions" });
            }

            const id = req.params.id;
            const transaction = await this.dailyTransactionService.getDailyTransactionById(id);
            
            // Ensure client can only access their own transactions
            if (transaction.clientId !== req.clientId) {
                return res.status(403).json({ message: "You are not authorized to view this transaction" });
            }
            
            return res.status(200).json(transaction);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
    /**
     * Get a daily transaction by client ID
     */
    getByClientId = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const clientId = req.params.clientId;
            const transactions = await this.dailyTransactionService.getDailyTransactionsByClient(clientId);

            return res.status(200).json(transactions);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Create a new daily transaction
     */
    create = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can create daily transactions" });
            }

            const { description, amount, type, date, categoryId } = req.body;
            
            const transaction = await this.dailyTransactionService.createDailyTransaction({
                description,
                amount,
                type,
                date: new Date(date),
                clientId: req.clientId,
                categoryId
            });
            
            return res.status(201).json({
                message: "Daily transaction created successfully",
                transaction
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error creating daily transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update a daily transaction
     */
    update = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can update daily transactions" });
            }

            const id = req.params.id;
            const { description, amount, type, date, categoryId } = req.body;
            
            // Get transaction to check ownership
            const transaction = await this.dailyTransactionService.getDailyTransactionById(id);
            
            // Ensure client can only update their own transactions
            if (transaction.clientId !== req.clientId) {
                return res.status(403).json({ message: "You are not authorized to update this transaction" });
            }
            
            const updatedTransaction = await this.dailyTransactionService.updateDailyTransaction(id, {
                description,
                amount,
                type,
                date: date ? new Date(date) : undefined,
                categoryId
            });
            
            return res.status(200).json({
                message: "Daily transaction updated successfully",
                transaction: updatedTransaction
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating daily transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Delete a daily transaction
     */
    delete = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can delete daily transactions" });
            }

            const id = req.params.id;
            
            // Get transaction to check ownership
            const transaction = await this.dailyTransactionService.getDailyTransactionById(id);
            
            // Ensure client can only delete their own transactions
            if (transaction.clientId !== req.clientId) {
                return res.status(403).json({ message: "You are not authorized to delete this transaction" });
            }
            
            await this.dailyTransactionService.deleteDailyTransaction(id);
            
            return res.status(200).json({
                message: "Daily transaction deleted successfully"
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deleting daily transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get daily transactions sum by date
     */
    getSumByDate = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can access their daily transactions sum" });
            }

            const date = new Date(req.params.date);
            const sum = await this.dailyTransactionService.getDailyTransactionsSumByDate(req.clientId, date);
            
            return res.status(200).json({ sum });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily transactions sum by date:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get daily transactions sum by month
     */
    getSumByMonth = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can access their daily transactions sum" });
            }

            const year = parseInt(req.params.year);
            const month = parseInt(req.params.month);
            
            const sum = await this.dailyTransactionService.getDailyTransactionsSumByMonth(req.clientId, year, month);
            
            return res.status(200).json({ sum });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily transactions sum by month:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
