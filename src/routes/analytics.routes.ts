import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authMiddleware } from "../middlewares";

const analyticsRouter = Router();
const analyticsController = new AnalyticsController();

// Apply authentication middleware to all analytics routes
analyticsRouter.use(authMiddleware);

// Category spending endpoint
analyticsRouter.get(
    "/category-spending/:clientId",
    analyticsController.clientIdValidation,
    analyticsController.getCategorySpending
);

// Daily spending trend endpoint
analyticsRouter.get(
    "/daily-trend/:clientId",
    analyticsController.clientIdValidation,
    analyticsController.getDailySpendingTrend
);

// Monthly balance endpoint
analyticsRouter.get(
    "/monthly-balance/:clientId",
    analyticsController.clientIdValidation,
    analyticsController.getMonthlyBalance
);

export { analyticsRouter };
