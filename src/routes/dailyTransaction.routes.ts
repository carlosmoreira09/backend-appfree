import { Router } from "express";
import { DailyTransactionController } from "../controllers/DailyTransactionController";
import { authMiddleware } from "../middlewares";

const router = Router();
const dailyTransactionController = new DailyTransactionController();

router.get("/",authMiddleware, dailyTransactionController.getAll);
router.get("/client/:clientId",[authMiddleware, ...dailyTransactionController.clientIdValidation], dailyTransactionController.getByClientId);
router.get("/client/:clientId/date/:date", [authMiddleware,
    ...dailyTransactionController.clientIdValidation,
    ...dailyTransactionController.dateValidation
], dailyTransactionController.getClientTransactionsByDate);
router.get("/date/:date", [authMiddleware,...dailyTransactionController.dateValidation], dailyTransactionController.getByDate);
router.get("/year/:year/month/:month", [authMiddleware,...dailyTransactionController.yearMonthValidation], dailyTransactionController.getByMonth);
router.get("/:id", [authMiddleware,...dailyTransactionController.idValidation], dailyTransactionController.getById);
router.post("/", [authMiddleware,...dailyTransactionController.transactionValidation], dailyTransactionController.create);
router.put("/:id", [authMiddleware,
    ...dailyTransactionController.idValidation,
    ...dailyTransactionController.transactionValidation
], dailyTransactionController.update);
router.delete("/:id", [authMiddleware,...dailyTransactionController.idValidation], dailyTransactionController.delete);
router.get("/sum/date/:date", [authMiddleware,...dailyTransactionController.dateValidation], dailyTransactionController.getSumByDate);
router.get("/sum/year/:year/month/:month", [authMiddleware,...dailyTransactionController.yearMonthValidation], dailyTransactionController.getSumByMonth);

export default router;
