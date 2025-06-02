import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "../services/LoggerService";
import { RoleService } from "../services/RoleService";
import { RoleType } from "../entities/Role";

export class RoleController {
    private logger = LoggerService.getInstance();
    private roleService = new RoleService();

    /**
     * Validation rules for creating/updating roles
     */
    roleValidation = [
        body("name")
            .optional()
            .isIn(Object.values(RoleType)).withMessage("Invalid role name"),
        body("description")
            .optional()
            .isString().withMessage("Description must be a string"),
        body("isActive")
            .optional()
            .isBoolean().withMessage("isActive must be a boolean")
    ];

    /**
     * Validation rules for role ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid role ID format")
    ];

    /**
     * Get all roles
     */
    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            const roles = await this.roleService.getAllRoles();
            return res.status(200).json(roles);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching roles:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get a role by ID
     */
    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const role = await this.roleService.getRoleById(id);
            return res.status(200).json(role);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching role:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Create a new role
     */
    create = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, description } = req.body;

            // Validate required fields
            if (!name) {
                return res.status(400).json({ message: "Role name is required" });
            }

            // Create role
            const role = await this.roleService.createRole({
                name,
                description
            });

            return res.status(201).json(role);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error creating role:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Update a role
     */
    update = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const { name, description, isActive } = req.body;

            // Update role
            const role = await this.roleService.updateRole(id, {
                name,
                description,
                isActive
            });

            return res.status(200).json(role);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating role:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Delete a role
     */
    delete = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            await this.roleService.deleteRole(id);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deleting role:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
