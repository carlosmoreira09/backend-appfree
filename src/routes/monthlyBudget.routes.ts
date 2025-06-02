import { Router } from "express";
import { MonthlyBudgetController } from "../controllers/MonthlyBudgetController";
import { authMiddleware } from "../middlewares";

const router = Router();
const monthlyBudgetController = new MonthlyBudgetController();

// All routes require authentication
router.use(authMiddleware);

// Get all monthly budgets for the authenticated client
router.get("/", monthlyBudgetController.getAll);

// Get a monthly budget by ID
router.get("/:id", [...monthlyBudgetController.idValidation], monthlyBudgetController.getById);

// Get or create a monthly budget for a specific year and month
router.get("/year/:year/month/:month", [...monthlyBudgetController.yearMonthValidation], monthlyBudgetController.getOrCreateByYearMonth);

// Update monthly salary
router.patch("/:id/salary", [
    ...monthlyBudgetController.idValidation,
    ...monthlyBudgetController.monthlySalaryValidation
], monthlyBudgetController.updateMonthlySalary);

// Update budget amount
router.patch("/:id/budget", [
    ...monthlyBudgetController.idValidation,
    ...monthlyBudgetController.budgetAmountValidation
], monthlyBudgetController.updateBudgetAmount);

export default router;
