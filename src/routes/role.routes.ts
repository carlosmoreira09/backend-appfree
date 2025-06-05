import { Router } from "express";
import { RoleController } from "../controllers/RoleController";
import { authMiddleware, roleMiddleware } from "../middlewares";
import { RoleType } from "../entities/Role";

const router = Router();
const roleController = new RoleController();

router.get("/", [authMiddleware, roleMiddleware([RoleType.ADMIN])], roleController.getAll);
router.get("/:id", [authMiddleware, roleMiddleware([RoleType.ADMIN]), ...roleController.idValidation], roleController.getById);
router.post("/", [authMiddleware, roleMiddleware([RoleType.ADMIN]), ...roleController.roleValidation], roleController.create);
router.put("/:id", [authMiddleware, roleMiddleware([RoleType.ADMIN]), ...roleController.idValidation, ...roleController.roleValidation], roleController.update);
router.delete("/:id", [authMiddleware, roleMiddleware([RoleType.ADMIN]), ...roleController.idValidation], roleController.delete);

export default router;
