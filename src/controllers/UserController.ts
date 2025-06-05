import { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import * as bcrypt from "bcryptjs";
import {LoggerService, UserService} from "../services";
import {AppError} from "../middlewares";


export class UserController {
    private logger = LoggerService.getInstance();
    private userService = new UserService();

    /**
     * Validation rules for creating/updating users
     */
    userValidation = [
        body("name").optional().isString().withMessage("Name must be a string"),
        body("email").optional().isEmail().withMessage("Valid email is required"),
        body("password")
            .optional()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("isActive").optional().isBoolean().withMessage("isActive must be a boolean")
    ];

    /**
     * Validation rules for changing password
     */
    passwordValidation = [
        body("currentPassword")
            .exists()
            .withMessage("Current password is required"),
        body("newPassword")
            .exists()
            .isLength({ min: 6 })
            .withMessage("New password must be at least 6 characters long")
    ];

    /**
     * Validation rules for user ID
     */
    idValidation = [
        param("id").isUUID().withMessage("Invalid user ID format")
    ];

    getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            const users = await this.userService.getAllUsers();
            return res.status(200).json(users);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching users:", error);
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
            const user = await this.userService.getUserById(id);
            return res.status(200).json(user);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error fetching user:", error);
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

            const { name, email, password } = req.body;

            // Validate required fields
            if (!name || !email || !password) {
                return res.status(400).json({ message: "Name, email, and password are required" });
            }

            const user = await this.userService.createUser({ name, email, password });
            return res.status(201).json(user);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error creating user:", error);
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
            const { name, email, password, isActive } = req.body;

            const updatedUser = await this.userService.updateUser(id, {
                name,
                email,
                password,
                isActive
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error updating user:", error);
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
            await this.userService.deleteUser(id);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error deleting user:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    changePassword = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = req.params.id;
            const { currentPassword, newPassword } = req.body;
            
            // Verify user exists and get user with password
            const user = await this.userService.getUserWithPassword(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (req.userId !== id) {
                return res.status(403).json({ message: "You can only change your own password" });
            }
            
            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }
            
            // Update password
            await this.userService.updatePassword(id, newPassword);
            
            return res.status(200).json({ message: "Password updated successfully" });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error changing password:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
