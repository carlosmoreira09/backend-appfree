import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { findUserById, findClientById, findAuthByEmail } from "../repositories";
import { RoleType } from "../entities/Role";
import { AuthType } from "../entities/Auth";
import {AuthService, LoggerService} from "../services";
import {AppError} from "../middlewares";

export class AuthController {
    private authService = new AuthService();
    private logger = LoggerService.getInstance();

    /**
     * Validation rules for user registration
     */
    registerUserValidation = [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("role")
            .optional()
            .isIn(Object.values(RoleType))
            .withMessage("Invalid role")
    ];

    /**
     * Validation rules for login
     */
    loginValidation = [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required")
    ];

    /**
     * Validation rules for password change
     */
    changePasswordValidation = [
        body("email").isEmail().withMessage("Valid email is required"),
        body("currentPassword").notEmpty().withMessage("Current password is required"),
        body("newPassword")
            .isLength({ min: 6 })
            .withMessage("New password must be at least 6 characters long")
    ];

    /**
     * Validation rules for password reset
     */
    resetPasswordValidation = [
        body("email").isEmail().withMessage("Valid email is required"),
        body("newPassword")
            .isLength({ min: 6 })
            .withMessage("New password must be at least 6 characters long")
    ];

    /**
     * Register a new user
     */
    registerUser = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password, role } = req.body;
            const user = await this.authService.registerUser(name, email, password, role);

            return res.status(201).json({
                message: "User registered successfully",
                user
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error registering user:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Login a user or client
     */
    login = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            const result = await this.authService.login(email, password);

            return res.status(200).json({
                message: "Login successful",
                ...result
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error logging in:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Change password
     */
    changePassword = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, currentPassword, newPassword } = req.body;
            
            // Check if user is authorized to change this password
            const auth = await findAuthByEmail(email);
            if (!auth) {
                return res.status(404).json({ message: "User not found" });
            }
            
            // Check if user is changing their own password
            if (auth.type === AuthType.ADMIN && auth.userId !== req.userId) {
                return res.status(403).json({ message: "You are not authorized to change this password" });
            }
            
            if (auth.type === AuthType.CLIENT && auth.clientId !== req.clientId) {
                return res.status(403).json({ message: "You are not authorized to change this password" });
            }

            await this.authService.changePassword(email, currentPassword, newPassword);
            return res.status(200).json({ message: "Password changed successfully" });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error changing password:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Reset password (admin function)
     */
    resetPassword = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, newPassword } = req.body;
            await this.authService.resetPassword(email, newPassword);
            return res.status(200).json({ message: "Password reset successfully" });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            this.logger.error("Error resetting password:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Get the profile of the authenticated user or client
     */
    getProfile = async (req: Request, res: Response): Promise<Response> => {
        try {
            // Check if user is authenticated
            if (!req.authId) {
                return res.status(401).json({ message: "Authentication required" });
            }

            // Return profile based on auth type
            if (req.authType === AuthType.ADMIN && req.userId) {
                const user = await findUserById(req.userId);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.status(200).json({
                    type: AuthType.ADMIN,
                    profile: user
                });
            } else if (req.authType === AuthType.CLIENT && req.clientId) {
                const client = await findClientById(req.clientId);
                if (!client) {
                    return res.status(404).json({ message: "Client not found" });
                }
                return res.status(200).json({
                    type: AuthType.CLIENT,
                    profile: client
                });
            } else {
                return res.status(500).json({ message: "Invalid authentication type" });
            }
        } catch (error) {
            this.logger.error("Error fetching profile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
