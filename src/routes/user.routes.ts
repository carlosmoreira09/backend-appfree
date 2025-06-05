import { Router } from "express";
import { UserController } from "../controllers/UserController";
import {authMiddleware} from "../middlewares";

const router = Router();
const userController = new UserController();

router.get("/", userController.getAll);

router.get("/:id", userController.idValidation, userController.getById);
router.post("/", userController.userValidation, userController.create);
router.put("/:id", [authMiddleware, ...userController.idValidation, ...userController.userValidation], userController.update);
router.delete("/:id", [authMiddleware, ...userController.idValidation], userController.delete);

// Change password route - requires authentication
router.post("/:id/change-password", [
  authMiddleware, 
  ...userController.idValidation,
  ...userController.passwordValidation
], userController.changePassword);

export default router;
