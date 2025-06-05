import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware, roleMiddleware } from "../middlewares";
import { RoleType } from "../entities/Role";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.loginValidation, authController.login);
router.post("/register", authController.registerUserValidation, authController.registerUser);
router.get("/profile", authMiddleware, authController.getProfile);
router.post("/change-password", [authMiddleware, ...authController.changePasswordValidation], authController.changePassword);
router.post("/reset-password", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN]), 
    ...authController.resetPasswordValidation
], authController.resetPassword);

export default router;
