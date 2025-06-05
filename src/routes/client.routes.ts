import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { authMiddleware, roleMiddleware } from "../middlewares";
import { RoleType } from "../entities/Role";

const router = Router();
const clientController = new ClientController();

router.get("/", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]),
    ...clientController.listValidation
], clientController.getAll);
router.get("/:id", [
    authMiddleware, 
    ...clientController.idValidation
], clientController.getById);
router.post("/register", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.clientValidation
], clientController.registerClient);
router.post("/", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.clientValidation
], clientController.create);
router.put("/:id", [
    authMiddleware, 
    ...clientController.idValidation, 
    ...clientController.clientUpdateValidation
], clientController.update);
router.patch("/:id/deactivate", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.idValidation
], clientController.deactivate);
router.delete("/:id", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.idValidation
], clientController.delete);
router.get("/stats/dashboard", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER])
], clientController.getDashboardStats);
router.get("/stats/recent-activities", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER])
], clientController.getRecentActivities);

export default router;
