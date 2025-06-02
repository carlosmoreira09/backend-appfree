import { Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { TransactionType } from "../entities/Transaction";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "../services/LoggerService";
import { TransactionService } from "../services/TransactionService";

export class TransactionController {
    private logger = LoggerService.getInstance();
    private transactionService = new TransactionService();

    /**
     * Validation rules for creating/updating transactions
     */
    transactionValidation = [
        body("description")
            .notEmpty().withMessage("Description is required")
            .isString().withMessage("Description must be a string"),
        body("amount")
            .notEmpty().withMessage("Amount is required")
            .isNumeric().withMessage("Amount must be a number"),
        body("type")
            .optional()
            .isIn(Object.values(TransactionType)).withMessage("Type must be 'income' or 'expense'"),
        body("date")
            .notEmpty().withMessage("Date is required")
            .isISO8601().withMessage("Date must be a valid date in ISO 8601 format"),
        body("categoryId")
            .optional({ nullable: true })
            .custom(value => {
                // Allow null or valid UUID
                return value === null || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
            })
            .withMessage("Category ID must be null or a valid UUID")
    ];

    /**
     * Validation rules for transaction ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid transaction ID format")
    ];

    /**
     * Validation rules for summary query parameters
     */
    summaryValidation = [
        query("startDate")
            .notEmpty().withMessage("Start date is required")
            .isISO8601().withMessage("Start date must be a valid date in ISO 8601 format"),
        query("endDate")
            .notEmpty().withMessage("End date is required")
            .isISO8601().withMessage("End date must be a valid date in ISO 8601 format")
    ];

    /**
     * Get owner ID from request parameters
     * @param req Request object
     * @returns Owner ID (user ID or client ID)
     */
    private getOwnerId(req: Request): string {
        // Check if we're in a client context
        if (req.params.clientId) {
            return req.params.clientId;
        }
        
        // Check if we're in a user context
        if (req.params.userId) {
            return req.params.userId;
        }
        
        // Use authenticated client if available
        if (req.clientId) {
            return req.clientId;
        }
        
        // Use authenticated user as fallback
        return req.userId as string;
    }

    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            const ownerId = this.getOwnerId(req);
            const { startDate, endDate, type, categoryId } = req.query;

            const transactions = await this.transactionService.getAllTransactions(ownerId, {
                startDate: startDate as string,
                endDate: endDate as string,
                type: type as TransactionType,
                categoryId: categoryId as string
            });

            return res.status(200).json(transactions);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching transactions:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const ownerId = this.getOwnerId(req);

            const transaction = await this.transactionService.getTransactionById(id, ownerId);
            return res.status(200).json(transaction);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    create = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { description, amount, type, date, categoryId } = req.body;
            const ownerId = this.getOwnerId(req);

            const transaction = await this.transactionService.createTransaction(ownerId, {
                description,
                amount,
                type,
                date,
                categoryId
            });

            return res.status(201).json(transaction);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error creating transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    update = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const ownerId = this.getOwnerId(req);
            const { description, amount, type, date, categoryId } = req.body;

            const transaction = await this.transactionService.updateTransaction(id, ownerId, {
                description,
                amount,
                type,
                date,
                categoryId
            });

            return res.status(200).json(transaction);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    delete = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const ownerId = this.getOwnerId(req);

            await this.transactionService.deleteTransaction(id, ownerId);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deleting transaction:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    getSummary = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const ownerId = this.getOwnerId(req);
            const { startDate, endDate } = req.query;

            const summary = await this.transactionService.getTransactionSummary(
                ownerId,
                startDate as string,
                endDate as string
            );

            return res.status(200).json(summary);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error generating summary:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
