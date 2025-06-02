import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

// Public routes
router.get("/", userController.getAll);

// Protected routes that need validation
router.get("/:id", userController.idValidation, userController.getById);
router.post("/", userController.userValidation, userController.create);
router.put("/:id", [authMiddleware, ...userController.idValidation, ...userController.userValidation], userController.update);
router.delete("/:id", [authMiddleware, ...userController.idValidation], userController.delete);

export default router;
