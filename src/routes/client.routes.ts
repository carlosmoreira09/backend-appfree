import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { authMiddleware, roleMiddleware } from "../middlewares";
import { RoleType } from "../entities/Role";

const router = Router();
const clientController = new ClientController();

// Public routes
// None

// Protected routes (require authentication)
// List clients with pagination, filtering, and sorting
router.get("/", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]),
    ...clientController.listValidation
], clientController.getAll);

// Get client by ID
router.get("/:id", [
    authMiddleware, 
    ...clientController.idValidation
], clientController.getById);

// Register a client with authentication
router.post("/register", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.clientValidation
], clientController.registerClient);

// Create a client (without requiring password)
router.post("/", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.clientValidation
], clientController.create);

// Update a client
router.put("/:id", [
    authMiddleware, 
    ...clientController.idValidation, 
    ...clientController.clientValidation
], clientController.update);

// Deactivate a client
router.patch("/:id/deactivate", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.idValidation
], clientController.deactivate);

// Delete a client
router.delete("/:id", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER]), 
    ...clientController.idValidation
], clientController.delete);

// Admin dashboard stats
router.get("/stats/dashboard", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER])
], clientController.getDashboardStats);

// Recent client activities
router.get("/stats/recent-activities", [
    authMiddleware, 
    roleMiddleware([RoleType.ADMIN, RoleType.MANAGER])
], clientController.getRecentActivities);

export default router;
