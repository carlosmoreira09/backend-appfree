import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { authMiddleware, roleMiddleware } from "../middlewares";
import { RoleType } from "../entities/Role";

const router = Router();
const clientController = new ClientController();

// Public routes
// None

// Protected routes (require authentication)
router.get("/", [authMiddleware, roleMiddleware([RoleType.ADMIN, RoleType.MANAGER])], clientController.getAll);
router.get("/:id", [authMiddleware, ...clientController.idValidation], clientController.getById);
router.post("/", [authMiddleware, roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), ...clientController.clientValidation], clientController.create);
router.put("/:id", [authMiddleware, ...clientController.idValidation, ...clientController.clientValidation], clientController.update);
router.delete("/:id", [authMiddleware, roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), ...clientController.idValidation], clientController.delete);

export default router;
