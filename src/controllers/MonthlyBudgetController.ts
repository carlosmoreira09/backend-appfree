import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "../services/LoggerService";
import { MonthlyBudgetService } from "../services/MonthlyBudgetService";

export class MonthlyBudgetController {
    private logger = LoggerService.getInstance();
    private monthlyBudgetService = new MonthlyBudgetService();

    /**
     * Validation rules for monthly budget ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid monthly budget ID format")
    ];

    /**
     * Validation rules for monthly salary
     */
    monthlySalaryValidation = [
        body("monthlySalary")
            .isFloat({ min: 0 })
            .withMessage("Monthly salary must be a positive number")
    ];

    /**
     * Validation rules for budget amount
     */
    budgetAmountValidation = [
        body("budgetAmount")
            .isFloat({ min: 0 })
            .withMessage("Budget amount must be a positive number"),
        body("isPercentage")
            .isBoolean()
            .withMessage("isPercentage must be a boolean")
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
     * Get all monthly budgets for the authenticated client
     */
    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can access their monthly budgets" });
            }

            const budgets = await this.monthlyBudgetService.getMonthlyBudgetsByClient(req.clientId);
            return res.status(200).json(budgets);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching monthly budgets:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get a monthly budget by ID
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
                return res.status(403).json({ message: "Only clients can access their monthly budgets" });
            }

            const id = req.params.id;
            const budget = await this.monthlyBudgetService.getMonthlyBudgetById(id);
            
            // Ensure client can only access their own budgets
            if (budget.clientId !== req.clientId) {
                return res.status(403).json({ message: "You are not authorized to view this budget" });
            }
            
            return res.status(200).json(budget);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get or create a monthly budget for a specific year and month
     */
    getOrCreateByYearMonth = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can access their monthly budgets" });
            }

            const year = parseInt(req.params.year);
            const month = parseInt(req.params.month);
            
            const budget = await this.monthlyBudgetService.getOrCreateMonthlyBudget(req.clientId, year, month);
            return res.status(200).json(budget);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error getting or creating monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update monthly salary
     */
    updateMonthlySalary = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can update their monthly salary" });
            }

            const id = req.params.id;
            const { monthlySalary } = req.body;
            
            // Get budget to check ownership
            const budget = await this.monthlyBudgetService.getMonthlyBudgetById(id);
            
            // Ensure client can only update their own budgets
            if (budget.clientId !== req.clientId) {
                return res.status(403).json({ message: "You are not authorized to update this budget" });
            }
            
            const updatedBudget = await this.monthlyBudgetService.updateMonthlySalary(id, monthlySalary);
            return res.status(200).json({
                message: "Monthly salary updated successfully",
                budget: updatedBudget
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating monthly salary:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update budget amount
     */
    updateBudgetAmount = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Ensure client is authenticated
            if (!req.clientId) {
                return res.status(403).json({ message: "Only clients can update their budget amount" });
            }

            const id = req.params.id;
            const { budgetAmount, isPercentage } = req.body;
            
            // Get budget to check ownership
            const budget = await this.monthlyBudgetService.getMonthlyBudgetById(id);
            
            // Ensure client can only update their own budgets
            if (budget.clientId !== req.clientId) {
                return res.status(403).json({ message: "You are not authorized to update this budget" });
            }
            
            const updatedBudget = await this.monthlyBudgetService.updateBudgetAmount(id, budgetAmount, isPercentage);
            return res.status(200).json({
                message: "Budget amount updated successfully",
                budget: updatedBudget
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating budget amount:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
