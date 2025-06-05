import { Router } from "express";
import { MonthlyBudgetController } from "../controllers/MonthlyBudgetController";
import { authMiddleware } from "../middlewares";

const router = Router();
const monthlyBudgetController = new MonthlyBudgetController();

router.use(authMiddleware);
router.get("/", monthlyBudgetController.getAll);
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

export default router;
