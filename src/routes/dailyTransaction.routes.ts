import { Router } from "express";
import { DailyTransactionController } from "../controllers/DailyTransactionController";
import {authMiddleware, roleMiddleware} from "../middlewares";
import {RoleType} from "../entities/Role";

const router = Router();
const dailyTransactionController = new DailyTransactionController();

router.use(authMiddleware);
router.get("/", dailyTransactionController.getAll);
router.get("/client/:clientId", [
    roleMiddleware([RoleType.CLIENT, RoleType.ADMIN]),
    ...dailyTransactionController.clientIdValidation
], dailyTransactionController.getByClientId);
router.get("/client/:clientId/date/:date", [
    ...dailyTransactionController.clientIdValidation,
    ...dailyTransactionController.dateValidation
], dailyTransactionController.getClientTransactionsByDate);
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
