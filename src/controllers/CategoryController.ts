import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "../services/LoggerService";
import { CategoryService } from "../services/CategoryService";
import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";
import { User } from "../entities/User";

export class CategoryController {
    private logger = LoggerService.getInstance();
    private categoryService = new CategoryService();
    private categoryRepository = AppDataSource.getRepository(Category);
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Validation rules for creating/updating categories
     */
    categoryValidation = [
        body("name")
            .notEmpty().withMessage("Name is required")
            .isString().withMessage("Name must be a string"),
        body("color")
            .optional()
            .isString().withMessage("Color must be a string")
            .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage("Color must be a valid hex color"),
        body("icon")
            .optional()
            .isString().withMessage("Icon must be a string")
    ];

    /**
     * Validation rules for category ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid category ID format")
    ];

    /**
     * Get owner ID from request parameters
     * @param req Request object
     * @returns Owner ID (user ID or client ID)
     */
    private getOwnerId(req: Request): string {
        // Check if we're in a client context
        if (req.params.clientId) {
            return req.params.clientId;
        }
        
        // Check if we're in a user context
        if (req.params.userId) {
            return req.params.userId;
        }
        
        // Use authenticated client if available
        if (req.clientId) {
            return req.clientId;
        }
        
        // Use authenticated user as fallback
        return req.userId as string;
    }

    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            const ownerId = this.getOwnerId(req);
            const categories = await this.categoryService.getAllCategories(ownerId);
            return res.status(200).json(categories);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching categories:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    getById = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const ownerId = this.getOwnerId(req);

            const category = await this.categoryService.getCategoryById(id, ownerId);
            return res.status(200).json(category);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching category:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    create = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, color, icon } = req.body;
            const ownerId = this.getOwnerId(req);

            const category = await this.categoryService.createCategory(ownerId, {
                name,
                color,
                icon
            });

            return res.status(201).json(category);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error creating category:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    update = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const ownerId = this.getOwnerId(req);
            const { name, color, icon } = req.body;

            const category = await this.categoryService.updateCategory(id, ownerId, {
                name,
                color,
                icon
            });

            return res.status(200).json(category);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating category:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    delete = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const ownerId = this.getOwnerId(req);

            await this.categoryService.deleteCategory(id, ownerId);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deleting category:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
