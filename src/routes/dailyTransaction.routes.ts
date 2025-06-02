import { Router } from "express";
import { DailyTransactionController } from "../controllers/DailyTransactionController";
import { authMiddleware } from "../middlewares";

const router = Router();
const dailyTransactionController = new DailyTransactionController();

// All routes require authentication
router.use(authMiddleware);

// Get all daily transactions for the authenticated client
router.get("/", dailyTransactionController.getAll);

// Get daily transactions for a specific date
router.get("/date/:date", [...dailyTransactionController.dateValidation], dailyTransactionController.getByDate);

// Get daily transactions for a specific month
router.get("/year/:year/month/:month", [...dailyTransactionController.yearMonthValidation], dailyTransactionController.getByMonth);

// Get a daily transaction by ID
router.get("/:id", [...dailyTransactionController.idValidation], dailyTransactionController.getById);

// Create a new daily transaction
router.post("/", [...dailyTransactionController.transactionValidation], dailyTransactionController.create);

// Update a daily transaction
router.put("/:id", [
    ...dailyTransactionController.idValidation,
    ...dailyTransactionController.transactionValidation
], dailyTransactionController.update);

// Delete a daily transaction
router.delete("/:id", [...dailyTransactionController.idValidation], dailyTransactionController.delete);

// Get daily transactions sum by date
router.get("/sum/date/:date", [...dailyTransactionController.dateValidation], dailyTransactionController.getSumByDate);

// Get daily transactions sum by month
router.get("/sum/year/:year/month/:month", [...dailyTransactionController.yearMonthValidation], dailyTransactionController.getSumByMonth);

export default router;
