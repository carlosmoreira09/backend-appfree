import { Router } from "express";
import { DailyTransactionController } from "../controllers/DailyTransactionController";
import { authMiddleware } from "../middlewares";

const router = Router();
const dailyTransactionController = new DailyTransactionController();

router.use(authMiddleware);
router.get("/", dailyTransactionController.getAll);
router.get("/client/:clientId", [...dailyTransactionController.clientIdValidation], dailyTransactionController.getByClientId);
router.get("/date/:date", [...dailyTransactionController.dateValidation], dailyTransactionController.getByDate);
router.get("/year/:year/month/:month", [...dailyTransactionController.yearMonthValidation], dailyTransactionController.getByMonth);
router.get("/:id", [...dailyTransactionController.idValidation], dailyTransactionController.getById);
router.post("/", [...dailyTransactionController.transactionValidation], dailyTransactionController.create);
router.put("/:id", [
    ...dailyTransactionController.idValidation,
    ...dailyTransactionController.transactionValidation
], dailyTransactionController.update);
router.delete("/:id", [...dailyTransactionController.idValidation], dailyTransactionController.delete);
router.get("/sum/date/:date", [...dailyTransactionController.dateValidation], dailyTransactionController.getSumByDate);
router.get("/sum/year/:year/month/:month", [...dailyTransactionController.yearMonthValidation], dailyTransactionController.getSumByMonth);

export default router;
