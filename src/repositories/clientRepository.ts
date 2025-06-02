import { AppDataSource } from "../data-source";
import { Client } from "../entities/Client";
import { LoggerService } from "../services/LoggerService";

/**
 * Repository for Client entity
 */
const clientRepository = AppDataSource.getRepository(Client);
const logger = LoggerService.getInstance();

/**
 * Find all clients
 * @returns Array of clients
 */
export const findAllClients = async (): Promise<Client[]> => {
  try {
    return await clientRepository.find({
      relations: ["manager"],
      order: { name: "ASC" }
    });
  } catch (error) {
    logger.error("Error finding all clients:", error);
    throw error;
  }
};

/**
 * Find all clients for a manager
 * @param managerId Manager ID
 * @returns Array of clients
 */
export const findClientsByManager = async (managerId: string): Promise<Client[]> => {
  try {
    return await clientRepository.find({
      where: { manager: { id: managerId } },
      relations: ["manager"],
      order: { name: "ASC" }
    });
  } catch (error) {
    logger.error(`Error finding clients for manager ${managerId}:`, error);
    throw error;
  }
};

/**
 * Find a client by ID
 * @param id Client ID
 * @returns Client or null if not found
 */
export const findClientById = async (id: string): Promise<Client | null> => {
  try {
    return await clientRepository.findOne({
      where: { id },
      relations: ["manager"]
    });
  } catch (error) {
    logger.error(`Error finding client with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Find a client by email
 * @param email Client email
 * @returns Client or null if not found
 */
export const findClientByEmail = async (email: string): Promise<Client | null> => {
  try {
    return await clientRepository.findOne({
      where: { email },
      relations: ["manager"]
    });
  } catch (error) {
    logger.error(`Error finding client with email ${email}:`, error);
    throw error;
  }
};

/**
 * Find a client by CPF
 * @param cpf Client CPF
 * @returns Client or null if not found
 */
export const findClientByCpf = async (cpf: string): Promise<Client | null> => {
  try {
    return await clientRepository.findOne({
      where: { cpf },
      relations: ["manager"]
    });
  } catch (error) {
    logger.error(`Error finding client with CPF ${cpf}:`, error);
    throw error;
  }
};

/**
 * Create a new client
 * @param clientData Client data
 * @returns Created client
 */
export const createClient = async (clientData: Partial<Client>): Promise<Client> => {
  try {
    const client = clientRepository.create(clientData);
    return await clientRepository.save(client);
  } catch (error) {
    logger.error("Error creating client:", error);
    throw error;
  }
};

/**
 * Update a client
 * @param client Client to update
 * @returns Updated client
 */
export const updateClient = async (client: Client): Promise<Client> => {
  try {
    return await clientRepository.save(client);
  } catch (error) {
    logger.error(`Error updating client with ID ${client.id}:`, error);
    throw error;
  }
};

/**
 * Delete a client
 * @param client Client to delete
 * @returns Deleted client
 */
export const deleteClient = async (client: Client): Promise<Client> => {
  try {
    return await clientRepository.remove(client);
  } catch (error) {
    logger.error(`Error deleting client with ID ${client.id}:`, error);
    throw error;
  }
};

export default clientRepository;
