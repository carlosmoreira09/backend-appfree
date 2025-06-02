import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { authMiddleware } from "../middlewares";

const router = Router({ mergeParams: true });
const transactionController = new TransactionController();

// Transaction routes (all protected by authMiddleware)
router.get("/", authMiddleware, transactionController.getAll);
router.get("/summary", [authMiddleware, ...transactionController.summaryValidation], transactionController.getSummary);
router.get("/:id", [authMiddleware, ...transactionController.idValidation], transactionController.getById);
router.post("/", [authMiddleware, ...transactionController.transactionValidation], transactionController.create);
router.put("/:id", [authMiddleware, ...transactionController.idValidation, ...transactionController.transactionValidation], transactionController.update);
router.delete("/:id", [authMiddleware, ...transactionController.idValidation], transactionController.delete);

export default router;
