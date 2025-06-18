import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import {LoggerService, MonthlyBudgetService} from "../services";
import {AppError} from "../middlewares";
import { AuthType } from "../entities/Auth";

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
     * Get all monthly budgets - accessible by clients (their own) and admins (all)
     */
    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check authentication
            if (!req.authType) {
                return res.status(401).json({ message: "Authentication required" });
            }

            if (req.authType === AuthType.ADMIN) {
                // Admin can see all budgets with client information
                const budgets = await this.monthlyBudgetService.getAllWithClients();
                return res.status(200).json(budgets);
            } else if (req.authType === AuthType.CLIENT && req.clientId) {
                // Client can only see their own budgets
                const budgets = await this.monthlyBudgetService.getMonthlyBudgetsByClient(req.clientId);
                return res.status(200).json(budgets);
            } else {
                return res.status(403).json({ message: "Access denied" });
            }
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching monthly budgets:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get a monthly budget by ID - accessible by clients (their own) and admins (any)
     */
    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check authentication
            if (!req.authType) {
                return res.status(401).json({ message: "Authentication required" });
            }

            const id = req.params.id;
            const budget = await this.monthlyBudgetService.getMonthlyBudgetById(id);
            
            if (req.authType === AuthType.ADMIN) {
                // Admin can access any budget
                return res.status(200).json(budget);
            } else if (req.authType === AuthType.CLIENT && req.clientId) {
                // Client can only access their own budgets
                if (budget.clientId !== req.clientId) {
                    return res.status(403).json({ message: "You are not authorized to view this budget" });
                }
                return res.status(200).json(budget);
            } else {
                return res.status(403).json({ message: "Access denied" });
            }
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get or create monthly budget for specific year/month
     */
    getOrCreateByYearMonth = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check authentication
            if (!req.authType) {
                return res.status(401).json({ message: "Authentication required" });
            }

            const year = parseInt(req.params.year);
            const month = parseInt(req.params.month);

            if (req.authType === AuthType.ADMIN) {
                // Admin needs to specify clientId in request body or params
                const clientId = req.body.clientId || req.params.clientId;
                if (!clientId) {
                    return res.status(400).json({ message: "Client ID is required for admin access" });
                }
                const budget = await this.monthlyBudgetService.getOrCreateMonthlyBudget(clientId, year, month);
                return res.status(200).json(budget);
            } else if (req.authType === AuthType.CLIENT && req.clientId) {
                // Client can only create/get their own budget
                const budget = await this.monthlyBudgetService.getOrCreateMonthlyBudget(req.clientId, year, month);
                return res.status(200).json(budget);
            } else {
                return res.status(403).json({ message: "Access denied" });
            }
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error getting/creating monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update monthly salary - accessible by clients (their own) and admins (any)
     */
    updateMonthlySalary = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check authentication
            if (!req.authType) {
                return res.status(401).json({ message: "Authentication required" });
            }

            const id = req.params.id;
            const { monthlySalary } = req.body;

            // Get budget first to check ownership
            const budget = await this.monthlyBudgetService.getMonthlyBudgetById(id);

            if (req.authType === AuthType.ADMIN) {
                // Admin can update any budget
                const updatedBudget = await this.monthlyBudgetService.updateMonthlySalary(id, monthlySalary);
                return res.status(200).json({
                    message: "Monthly salary updated successfully",
                    budget: updatedBudget
                });
            } else if (req.authType === AuthType.CLIENT && req.clientId) {
                // Client can only update their own budget
                if (budget.clientId !== req.clientId) {
                    return res.status(403).json({ message: "You are not authorized to update this budget" });
                }
                const updatedBudget = await this.monthlyBudgetService.updateMonthlySalary(id, monthlySalary);
                return res.status(200).json({
                    message: "Monthly salary updated successfully",
                    budget: updatedBudget
                });
            } else {
                return res.status(403).json({ message: "Access denied" });
            }
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating monthly salary:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update budget amount - accessible by clients (their own) and admins (any)
     */
    updateBudgetAmount = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check authentication
            if (!req.authType) {
                return res.status(401).json({ message: "Authentication required" });
            }

            const id = req.params.id;
            const { budgetAmount, isPercentage } = req.body;

            // Get budget first to check ownership
            const budget = await this.monthlyBudgetService.getMonthlyBudgetById(id);

            if (req.authType === AuthType.ADMIN) {
                // Admin can update any budget
                const updatedBudget = await this.monthlyBudgetService.updateBudgetAmount(id, budgetAmount, isPercentage);
                return res.status(200).json({
                    message: "Budget amount updated successfully",
                    budget: updatedBudget
                });
            } else if (req.authType === AuthType.CLIENT && req.clientId) {
                // Client can only update their own budget
                if (budget.clientId !== req.clientId) {
                    return res.status(403).json({ message: "You are not authorized to update this budget" });
                }
                const updatedBudget = await this.monthlyBudgetService.updateBudgetAmount(id, budgetAmount, isPercentage);
                return res.status(200).json({
                    message: "Budget amount updated successfully",
                    budget: updatedBudget
                });
            } else {
                return res.status(403).json({ message: "Access denied" });
            }
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating budget amount:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get monthly budgets by client ID - accessible by admins only
     */
    getByClientId = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check authentication - only admins can access other clients' budgets
            if (!req.authType || req.authType !== AuthType.ADMIN) {
                return res.status(403).json({ message: "Admin access required" });
            }

            const { clientId } = req.params;
            
            if (!clientId) {
                return res.status(400).json({ message: "Client ID is required" });
            }

            const budgets = await this.monthlyBudgetService.getMonthlyBudgetsByClient(clientId);
            return res.status(200).json(budgets);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching monthly budgets by client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get or create monthly budget for specific client, year and month - accessible by admins only
     */
    getOrCreateByClientYearMonth = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check authentication - only admins can access other clients' budgets
            if (!req.authType || req.authType !== AuthType.ADMIN) {
                return res.status(403).json({ message: "Admin access required" });
            }

            const { clientId, year, month } = req.params;
            
            if (!clientId) {
                return res.status(400).json({ message: "Client ID is required" });
            }

            const budget = await this.monthlyBudgetService.getOrCreateMonthlyBudget(
                clientId, 
                parseInt(year), 
                parseInt(month)
            );
            
            return res.status(200).json(budget);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error getting/creating monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update monthly budget (admin only) - allows updating multiple fields at once
     */
    adminUpdate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const { monthlySalary, budgetAmount, isPercentage } = req.body;
            
            if (!id) {
                return res.status(400).json({ message: "Budget ID is required" });
            }

            let updatedBudget = await this.monthlyBudgetService.getMonthlyBudgetById(id);

            // Update monthly salary if provided
            if (monthlySalary !== undefined) {
                updatedBudget = await this.monthlyBudgetService.updateMonthlySalary(id, monthlySalary);
            }

            // Update budget amount if provided
            if (budgetAmount !== undefined && isPercentage !== undefined) {
                updatedBudget = await this.monthlyBudgetService.updateBudgetAmount(id, budgetAmount, isPercentage);
            }

            return res.status(200).json({
                message: "Monthly budget updated successfully",
                budget: updatedBudget
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Delete monthly budget (admin only)
     */
    adminDelete = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ message: "Budget ID is required" });
            }
            await this.monthlyBudgetService.deleteMonthlyBudget(id);
            
            return res.status(200).json({
                success: true,
                message: "Monthly budget deleted successfully"
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deleting monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get current daily budget status for authenticated client
     */
    getCurrentDailyStatus = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check authentication
            if (!req.authType || !req.clientId) {
                return res.status(401).json({ message: "Client authentication required" });
            }

            // Check if date query parameter is provided
            let targetDate: Date | undefined;
            if (req.query.date && typeof req.query.date === 'string') {
                targetDate = new Date(req.query.date);
                
                // Validate date
                if (isNaN(targetDate.getTime())) {
                    return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
                }
            }

            const dailyStatus = await this.monthlyBudgetService.getCurrentDailyBudgetStatus(req.clientId, targetDate);
            return res.status(200).json(dailyStatus);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily budget status:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Admin: Get all monthly budgets with client information
     */
    adminGetAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            const budgets = await this.monthlyBudgetService.getAllWithClients();
            return res.status(200).json(budgets);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching all monthly budgets:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Admin: Get monthly budgets by client ID
     */
    adminGetByClientId = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { clientId } = req.params;
            
            if (!clientId) {
                return res.status(400).json({ message: "Client ID is required" });
            }

            const budgets = await this.monthlyBudgetService.getMonthlyBudgetsByClient(clientId);
            return res.status(200).json(budgets);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching monthly budgets by client:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Admin: Get or create monthly budget for specific client, year and month
     */
    adminGetOrCreateByYearMonth = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { clientId, year, month } = req.params;
            
            if (!clientId) {
                return res.status(400).json({ message: "Client ID is required" });
            }

            const budget = await this.monthlyBudgetService.getOrCreateMonthlyBudget(
                clientId, 
                parseInt(year), 
                parseInt(month)
            );
            
            return res.status(200).json(budget);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error getting/creating monthly budget:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
