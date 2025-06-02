import { Request, Response, NextFunction } from "express";
import { LoggerService } from "../services/LoggerService";

export class AppError extends Error {
    public readonly statusCode: number;
    
    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorMiddleware = (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    const logger = LoggerService.getInstance();
    logger.error("Application error:", error);

    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        });
    }

    return response.status(500).json({
        status: "error",
        message: "Internal server error"
    });
};
