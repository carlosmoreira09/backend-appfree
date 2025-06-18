import { Router } from "express";
import { MonthlyBudgetController } from "../controllers/MonthlyBudgetController";
import { authMiddleware, roleMiddleware } from "../middlewares";

const router = Router();
const monthlyBudgetController = new MonthlyBudgetController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes accessible by both clients and admins
router.get("/", monthlyBudgetController.getAll);
router.get("/daily-status", monthlyBudgetController.getCurrentDailyStatus);
router.get("/:id", [...monthlyBudgetController.idValidation], monthlyBudgetController.getById);
router.get("/year/:year/month/:month", [...monthlyBudgetController.yearMonthValidation], monthlyBudgetController.getOrCreateByYearMonth);
router.patch("/:id/salary", [
    ...monthlyBudgetController.idValidation,
    ...monthlyBudgetController.monthlySalaryValidation
], monthlyBudgetController.updateMonthlySalary);
router.patch("/:id/budget", [
    ...monthlyBudgetController.idValidation,
    ...monthlyBudgetController.budgetAmountValidation
], monthlyBudgetController.updateBudgetAmount);

// Admin-only routes
router.get("/clients/:clientId", [roleMiddleware(['admin'])], monthlyBudgetController.getByClientId);
router.get("/clients/:clientId/year/:year/month/:month", [
    roleMiddleware(['admin']),
    ...monthlyBudgetController.yearMonthValidation
], monthlyBudgetController.getOrCreateByClientYearMonth);
router.put("/:id", [
    roleMiddleware(['admin']),
    ...monthlyBudgetController.idValidation
], monthlyBudgetController.adminUpdate);
router.delete("/:id", [
    roleMiddleware(['admin']),
    ...monthlyBudgetController.idValidation
], monthlyBudgetController.adminDelete);

export default router;
