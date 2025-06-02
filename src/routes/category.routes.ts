import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { authMiddleware } from "../middlewares";

const router = Router({ mergeParams: true });
const categoryController = new CategoryController();

// Category routes (all protected by authMiddleware)
router.get("/", authMiddleware, categoryController.getAll);
router.get("/:id", [authMiddleware, ...categoryController.idValidation], categoryController.getById);
router.post("/", [authMiddleware, ...categoryController.categoryValidation], categoryController.create);
router.put("/:id", [authMiddleware, ...categoryController.idValidation, ...categoryController.categoryValidation], categoryController.update);
router.delete("/:id", [authMiddleware, ...categoryController.idValidation], categoryController.delete);

export default router;
