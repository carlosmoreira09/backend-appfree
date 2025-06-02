import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import categoryRoutes from "./category.routes";
import transactionRoutes from "./transaction.routes";
import clientRoutes from "./client.routes";
import roleRoutes from "./role.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/roles", roleRoutes);

// Routes with user/client context
router.use("/users/:userId/categories", categoryRoutes);
router.use("/users/:userId/transactions", transactionRoutes);
router.use("/clients/:clientId/categories", categoryRoutes);
router.use("/clients/:clientId/transactions", transactionRoutes);

export default router;
