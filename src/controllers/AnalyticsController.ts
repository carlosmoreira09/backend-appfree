import { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { AppError } from "../middlewares";
import { LoggerService } from "../services";
import { AnalyticsService } from "../services/AnalyticsService";

export class AnalyticsController {
    private logger = LoggerService.getInstance();
    private analyticsService = new AnalyticsService();

    /**
     * Validation rules for client ID
     */
    clientIdValidation = [
        param("clientId").isUUID().withMessage("Invalid client ID format")
    ];

    /**
     * Get category spending data for a client
     */
    getCategorySpending = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const clientId = req.params.clientId;
            
            // Verify access permission
            if (req.clientId && req.clientId !== clientId) {
                return res.status(403).json({ message: "Access denied" });
            }

            const categorySpending = await this.analyticsService.getCategorySpending(clientId);
            return res.status(200).json(categorySpending);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching category spending:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get daily spending trend data for a client
     */
    getDailySpendingTrend = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const clientId = req.params.clientId;
            
            // Verify access permission
            if (req.clientId && req.clientId !== clientId) {
                return res.status(403).json({ message: "Access denied" });
            }

            // Optional query parameters
            const days = req.query.days ? parseInt(req.query.days as string) : 7;

            const dailyTrend = await this.analyticsService.getDailySpendingTrend(clientId, days);
            return res.status(200).json(dailyTrend);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching daily spending trend:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get monthly balance data for a client
     */
    getMonthlyBalance = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const clientId = req.params.clientId;
            
            // Verify access permission
            if (req.clientId && req.clientId !== clientId) {
                return res.status(403).json({ message: "Access denied" });
            }

            // Optional query parameters
            const months = req.query.months ? parseInt(req.query.months as string) : 6;

            const monthlyBalance = await this.analyticsService.getMonthlyBalance(clientId, months);
            return res.status(200).json(monthlyBalance);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching monthly balance:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
