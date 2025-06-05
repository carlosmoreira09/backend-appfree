import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import {authMiddleware, roleMiddleware} from "../middlewares";
import {RoleType} from "../entities/Role";

const router = Router({ mergeParams: true });
const categoryController = new CategoryController();

// Get all categories - accessible by both clients and admins
router.get("/", [
    authMiddleware,
    roleMiddleware([RoleType.CLIENT, RoleType.ADMIN])], categoryController.getAll);

// Get category by ID - accessible by both clients and admins
router.get("/:id", [
    authMiddleware, 
    roleMiddleware([RoleType.CLIENT, RoleType.ADMIN]),
    ...categoryController.idValidation
], categoryController.getById);

// Create category - admin only
router.post("/", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN]),
    ...categoryController.categoryValidation
], categoryController.create);

// Update category - admin only
router.put("/:id", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN]),
    ...categoryController.idValidation, 
    ...categoryController.categoryValidation
], categoryController.update);

// Delete category - admin only
router.delete("/:id", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN]),
    ...categoryController.idValidation
], categoryController.delete);

export default router;
