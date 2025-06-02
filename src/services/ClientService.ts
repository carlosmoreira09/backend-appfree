import { Client, MaritalStatus } from "../entities/Client";
import { User } from "../entities/User";
import { AppError } from "../middlewares/error.middleware";
import { LoggerService } from "./LoggerService";
import {
  findUserById,
  findAllClients,
  findClientsByManager,
  findClientById,
  findClientByEmail,
  findClientByCpf,
  createClient,
  updateClient,
  deleteClient,
  findAllClientsPaginated,
  findClientsByManagerPaginated
} from "../repositories";

export class ClientService {
  private logger = LoggerService.getInstance();

  /**
   * Get all clients
   */
  public async getAllClients(): Promise<Client[]> {
    try {
      return await findAllClients();
    } catch (error) {
      this.logger.error("Error in getAllClients service:", error);
      throw new AppError("Failed to get clients", 500);
    }
  }

  /**
   * Get all clients with pagination, filtering, and sorting
   */
  public async getAllClientsPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = "name",
    sortOrder: "ASC" | "DESC" = "ASC",
    isActive?: boolean
  ): Promise<{ clients: Client[], total: number }> {
    try {
      return await findAllClientsPaginated(page, limit, search, sortBy, sortOrder, isActive);
    } catch (error) {
      this.logger.error("Error in getAllClientsPaginated service:", error);
      throw new AppError("Failed to get clients", 500);
    }
  }

  /**
   * Get all clients for a manager
   */
  public async getClientsByManager(managerId: string): Promise<Client[]> {
    try {
      // Validate manager exists
      const manager = await findUserById(managerId);
      if (!manager) {
        throw new AppError("Manager not found", 404);
      }

      return await findClientsByManager(managerId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getClientsByManager service for manager ID ${managerId}:`, error);
      throw new AppError("Failed to get clients", 500);
    }
  }

  /**
   * Get all clients for a manager with pagination, filtering, and sorting
   */
  public async getClientsByManagerPaginated(
    managerId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = "name",
    sortOrder: "ASC" | "DESC" = "ASC",
    isActive?: boolean
  ): Promise<{ clients: Client[], total: number }> {
    try {
      // Validate manager exists
      const manager = await findUserById(managerId);
      if (!manager) {
        throw new AppError("Manager not found", 404);
      }

      return await findClientsByManagerPaginated(managerId, page, limit, search, sortBy, sortOrder, isActive);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getClientsByManagerPaginated service for manager ID ${managerId}:`, error);
      throw new AppError("Failed to get clients", 500);
    }
  }

  /**
   * Get a client by ID
   */
  public async getClientById(id: string): Promise<Client> {
    try {
      const client = await findClientById(id);
      if (!client) {
        throw new AppError("Client not found", 404);
      }
      return client;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in getClientById service for ID ${id}:`, error);
      throw new AppError("Failed to get client", 500);
    }
  }

  /**
   * Create a new client
   */
  public async createClient(clientData: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
    birthday?: string;
    age?: number;
    salary?: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    complement?: string;
    maritalStatus?: MaritalStatus;
    managerId: string;
  }): Promise<Client> {
    try {
      const {
        name,
        email,
        cpf,
        phone,
        birthday,
        age,
        salary,
        address,
        city,
        state,
        zipCode,
        complement,
        maritalStatus,
        managerId
      } = clientData;

      // Check if client with email already exists
      const existingClientByEmail = await findClientByEmail(email);
      if (existingClientByEmail) {
        throw new AppError("Client with this email already exists", 409);
      }

      // Check if client with CPF already exists
      const existingClientByCpf = await findClientByCpf(cpf);
      if (existingClientByCpf) {
        throw new AppError("Client with this CPF already exists", 409);
      }

      // Validate manager exists
      const manager = await findUserById(managerId);
      if (!manager) {
        throw new AppError("Manager not found", 404);
      }

      // Create client
      const newClient = await createClient({
        name,
        email,
        cpf,
        phone,
        birthday: birthday ? new Date(birthday) : undefined,
        age,
        salary,
        address,
        city,
        state,
        zipCode,
        complement,
        maritalStatus,
        manager: manager as User // Type casting needed due to Omit<User, "password">
      });

      return newClient;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error("Error in createClient service:", error);
      throw new AppError("Failed to create client", 500);
    }
  }

  /**
   * Update a client
   */
  public async updateClient(
    id: string,
    updateData: {
      name?: string;
      email?: string;
      cpf?: string;
      phone?: string;
      birthday?: string;
      age?: number;
      salary?: number;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      complement?: string;
      maritalStatus?: MaritalStatus;
      isActive?: boolean;
      managerId?: string;
    }
  ): Promise<Client> {
    try {
      const {
        name,
        email,
        cpf,
        phone,
        birthday,
        age,
        salary,
        address,
        city,
        state,
        zipCode,
        complement,
        maritalStatus,
        isActive,
        managerId
      } = updateData;

      // Find client
      const client = await this.getClientById(id);

      // If email is being updated, check it's not already in use
      if (email && email !== client.email) {
        const existingClient = await findClientByEmail(email);
        if (existingClient) {
          throw new AppError("Email is already in use", 409);
        }
      }

      // If CPF is being updated, check it's not already in use
      if (cpf && cpf !== client.cpf) {
        const existingClient = await findClientByCpf(cpf);
        if (existingClient) {
          throw new AppError("CPF is already in use", 409);
        }
      }

      // If manager is being updated, validate new manager exists
      let manager: User | null = null;
      if (managerId && managerId !== client.managerId) {
        manager = await findUserById(managerId) as User;
        if (!manager) {
          throw new AppError("Manager not found", 404);
        }
      }

      // Update client properties
      if (name !== undefined) client.name = name;
      if (email !== undefined) client.email = email;
      if (cpf !== undefined) client.cpf = cpf;
      if (phone !== undefined) client.phone = phone;
      if (birthday !== undefined) client.birthday = new Date(birthday);
      if (age !== undefined) client.age = age;
      if (salary !== undefined) client.salary = salary;
      if (address !== undefined) client.address = address;
      if (city !== undefined) client.city = city;
      if (state !== undefined) client.state = state;
      if (zipCode !== undefined) client.zipCode = zipCode;
      if (complement !== undefined) client.complement = complement;
      if (maritalStatus !== undefined) client.maritalStatus = maritalStatus;
      if (isActive !== undefined) client.isActive = isActive;
      if (manager) client.manager = manager;

      // Save updated client
      return await updateClient(client);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in updateClient service for ID ${id}:`, error);
      throw new AppError("Failed to update client", 500);
    }
  }

  /**
   * Delete a client
   */
  public async deleteClient(id: string): Promise<void> {
    try {
      // Find client
      const client = await this.getClientById(id);

      // Delete client
      await deleteClient(client);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      this.logger.error(`Error in deleteClient service for ID ${id}:`, error);
      throw new AppError("Failed to delete client", 500);
    }
  }

  /**
   * Calculate client age based on birthday
   */
  public calculateAge(birthday: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    
    return age;
  }
}
