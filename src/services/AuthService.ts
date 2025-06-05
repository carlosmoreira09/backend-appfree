import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { Client } from "../entities/Client";
import { Auth, AuthType } from "../entities/Auth";
import {
  findUserByEmail, 
  createUser, 
  findAuthByEmail, 
  createAuth, 
  updateAuth,
  updateLastLogin,
  findRoleByName,
  findClientByEmail
} from "../repositories";
import { LoggerService } from "./LoggerService";
import { RoleType } from "../entities/Role";
import {AppError} from "../middlewares";

export class AuthService {
    private logger = LoggerService.getInstance();
    
    /**
     * Register a new user (manager/admin)
     */
    public async registerUser(name: string, email: string, password: string, roleType: RoleType = RoleType.MANAGER): Promise<Omit<User, "password">> {
        try {
            // Check if user with email already exists
            const existingUser = await findUserByEmail(email);
            if (existingUser) {
                throw new AppError("User with this email already exists", 409);
            }

            // Check if auth with email already exists
            const existingAuth = await findAuthByEmail(email);
            if (existingAuth) {
                throw new AppError("Email is already in use", 409);
            }

            // Get role
            const role = await findRoleByName(roleType);
            if (!role) {
                throw new AppError("Invalid role", 400);
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const user = await createUser({
                name,
                email,
                password: hashedPassword,
                role
            });

            // Create auth record
            await createAuth({
                email,
                password: hashedPassword,
                type: AuthType.ADMIN,
                userId: user.id
            });

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            this.logger.error("Error in register service:", error);
            throw new AppError("Failed to register user", 500);
        }
    }

    /**
     * Register a new client
     */
    public async registerClient(client: Client, password: string): Promise<Client> {
        try {
            // Check if auth with email already exists
            const existingAuth = await findAuthByEmail(client.email);
            if (existingAuth) {
                throw new AppError("Email is already in use for authentication", 409);
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create auth record
            await createAuth({
                email: client.email,
                password: hashedPassword,
                type: AuthType.CLIENT,
                clientId: client.id
            });

            return client;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            this.logger.error("Error in registerClient service:", error);
            throw new AppError("Failed to register client authentication", 500);
        }
    }

    /**
     * Login a user or client
     */
    public async login(email: string, password: string): Promise<{ 
        user?: Omit<User, "password">;
        client?: Client;
        token: string;
        type: AuthType;
    }> {
        try {
            // Find auth by email
            const auth = await findAuthByEmail(email, true);

            if (!auth) {
                throw new AppError("Invalid email or password", 401);
            }

            // Check if auth is active
            if (!auth.isActive) {
                throw new AppError("Account is inactive", 403);
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, auth.password);
            if (!isPasswordValid) {
                throw new AppError("Invalid email or password", 401);
            }

            // Update last login
            await updateLastLogin(auth.id);

            // Generate JWT token
            const token = this.generateToken(auth);

            // Return user/client data based on auth type
            if (auth.type === AuthType.ADMIN && auth.user) {
                const { password: _, ...userWithoutPassword } = auth.user;
                return { 
                    user: userWithoutPassword, 
                    token,
                    type: AuthType.ADMIN
                };
            } else if (auth.type === AuthType.CLIENT && auth.client) {
                return { 
                    client: auth.client, 
                    token,
                    type: AuthType.CLIENT
                };
            } else {
                throw new AppError("Invalid account type", 500);
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            this.logger.error("Error in login service:", error);
            throw new AppError("Failed to login", 500);
        }
    }

    /**
     * Change password
     */
    public async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
        try {
            // Find auth by email
            const auth = await findAuthByEmail(email, true);
            if (!auth) {
                throw new AppError("User not found", 404);
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, auth.password);
            if (!isPasswordValid) {
                throw new AppError("Current password is incorrect", 401);
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            auth.password = hashedPassword;
            await updateAuth(auth);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            this.logger.error("Error in changePassword service:", error);
            throw new AppError("Failed to change password", 500);
        }
    }

    /**
     * Reset password (admin function)
     */
    public async resetPassword(email: string, newPassword: string): Promise<void> {
        try {
            // Find auth by email
            const auth = await findAuthByEmail(email, true);
            if (!auth) {
                throw new AppError("User not found", 404);
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            auth.password = hashedPassword;
            await updateAuth(auth);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            this.logger.error("Error in resetPassword service:", error);
            throw new AppError("Failed to reset password", 500);
        }
    }

    /**
     * Generate JWT token
     */
    private generateToken(auth: Auth): string {
        const secret = process.env.JWT_SECRET || "your-secret-key";
        const expiresIn = '3d';
        const payload = {
            id: auth.id,
            email: auth.email,
            type: auth.type,
            userId: auth.userId,
            clientId: auth.clientId
        }
        return jwt.sign(payload,
            secret!,
            {expiresIn}
        );
    }

    /**
     * Verify JWT token
     */
    public verifyToken(token: string): any {
        try {
            const secret = process.env.JWT_SECRET || "your-secret-key";
            return jwt.verify(token, secret) as jwt.JwtPayload;
        } catch (error) {
            throw new AppError("Invalid or expired token", 401);
        }
    }
}
