import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { findUserById, findClientById, findAuthById } from "../repositories";
import { LoggerService } from "../services/LoggerService";
import { AppError } from "./error.middleware";
import { AuthType } from "../entities/Auth";

// Extend Express Request interface to include userId and clientId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            clientId?: string;
            authId?: string;
            authType?: AuthType;
        }
    }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches userId/clientId to request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const logger = LoggerService.getInstance();
    
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError("Authentication required", 401);
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AppError("Authentication required", 401);
        }

        // Verify token
        const authService = new AuthService();
        const decoded = authService.verifyToken(token);

        // Attach auth info to request
        req.authId = decoded.id;
        req.authType = decoded.type;
        req.userId = decoded.userId;
        req.clientId = decoded.clientId;

        // Check if auth exists
        const auth = await findAuthById(decoded.id);
        if (!auth) {
            throw new AppError("Invalid token", 401);
        }

        // Check if auth is active
        if (!auth.isActive) {
            throw new AppError("Account is inactive", 403);
        }

        // Check if user/client exists based on auth type
        if (auth.type === AuthType.USER && auth.userId) {
            const user = await findUserById(auth.userId);
            if (!user) {
                throw new AppError("User not found", 401);
            }
            if (!user.isActive) {
                throw new AppError("User account is inactive", 403);
            }
        } else if (auth.type === AuthType.CLIENT && auth.clientId) {
            const client = await findClientById(auth.clientId);
            if (!client) {
                throw new AppError("Client not found", 401);
            }
            if (!client.isActive) {
                throw new AppError("Client account is inactive", 403);
            }
        } else {
            throw new AppError("Invalid authentication type", 401);
        }

        // Continue to next middleware/route handler
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ 
                status: "error", 
                message: error.message 
            });
        }
        
        logger.error("Authentication error:", error);
        return res.status(401).json({ 
            status: "error", 
            message: "Authentication failed" 
        });
    }
};

/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role
 * @param roles Array of allowed roles
 */
export const roleMiddleware = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const logger = LoggerService.getInstance();
        
        try {
            // Check if user is authenticated
            if (!req.userId) {
                throw new AppError("Authentication required", 401);
            }

            // Get user with role
            const user = await findUserById(req.userId);
            if (!user) {
                throw new AppError("User not found", 401);
            }

            // Check if user has required role
            if (!user.role || !roles.includes(user.role.name)) {
                throw new AppError("Access denied", 403);
            }

            // Continue to next middleware/route handler
            next();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ 
                    status: "error", 
                    message: error.message 
                });
            }
            
            logger.error("Role authorization error:", error);
            return res.status(403).json({ 
                status: "error", 
                message: "Access denied" 
            });
        }
    };
};
