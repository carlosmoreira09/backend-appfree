import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import categoryRoutes from "./category.routes";
import transactionRoutes from "./transaction.routes";
import clientRoutes from "./client.routes";
import roleRoutes from "./role.routes";
import monthlyBudgetRoutes from "./monthlyBudget.routes";
import dailyTransactionRoutes from "./dailyTransaction.routes";
import { analyticsRouter } from "./analytics.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/roles", roleRoutes);
router.use("/monthly-budgets", monthlyBudgetRoutes);
router.use("/daily-transactions", dailyTransactionRoutes);
router.use("/categories", categoryRoutes);
router.use("/analytics", analyticsRouter);
router.use("/users/:userId/transactions", transactionRoutes);

export default router;
