import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientAuthRole1717326000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.query(`
            CREATE TYPE "role_type_enum" AS ENUM ('admin', 'manager', 'client');
            
            CREATE TABLE "roles" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" role_type_enum NOT NULL DEFAULT 'client',
                "description" varchar(255),
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

        // Create marital status enum
        await queryRunner.query(`
            CREATE TYPE "marital_status_enum" AS ENUM ('single', 'married', 'divorced', 'widowed', 'other');
        `);

        // Create clients table
        await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "email" varchar(255) NOT NULL UNIQUE,
                "cpf" varchar(255) NOT NULL UNIQUE,
                "phone" varchar(255),
                "birthday" date,
                "age" integer,
                "salary" decimal(10,2) DEFAULT 0,
                "address" varchar(255),
                "city" varchar(50),
                "state" varchar(50),
                "zipCode" varchar(20),
                "complement" varchar(255),
                "maritalStatus" marital_status_enum NOT NULL DEFAULT 'single',
                "isActive" boolean NOT NULL DEFAULT true,
                "managerId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_client_manager" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL
            );
        `);

        // Create auth type enum
        await queryRunner.query(`
            CREATE TYPE "auth_type_enum" AS ENUM ('user', 'client');
        `);

        // Create auth table
        await queryRunner.query(`
            CREATE TABLE "auth" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" varchar(255) NOT NULL UNIQUE,
                "password" varchar(255) NOT NULL,
                "type" auth_type_enum NOT NULL DEFAULT 'client',
                "isActive" boolean NOT NULL DEFAULT true,
                "lastLogin" TIMESTAMP,
                "refreshToken" varchar(255),
                "refreshTokenExpiry" TIMESTAMP,
                "userId" uuid,
                "clientId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_auth_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "fk_auth_client" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE
            );
        `);

        // Add roleId column to users table
        await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN "roleId" uuid;
            ALTER TABLE "users" ADD CONSTRAINT "fk_user_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL;
        `);

        // Update transactions table
        await queryRunner.query(`
            -- Add clientId column
            ALTER TABLE "transactions" ADD COLUMN "clientId" uuid;
            ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_client" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE;
            
            -- Add categoryId column explicitly
            ALTER TABLE "transactions" ADD COLUMN "categoryId" uuid;
            ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL;
            
            -- Update existing transactions with data from the user relationship
            UPDATE "transactions" t
            SET "clientId" = (
                SELECT c.id FROM "clients" c
                JOIN "users" u ON c."managerId" = u.id
                WHERE u.id = t."userId"
                LIMIT 1
            )
            WHERE t."userId" IS NOT NULL;
            
            -- Drop the user foreign key constraint
            ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "FK_transactions_user";
            
            -- Drop the userId column
            ALTER TABLE "transactions" DROP COLUMN IF EXISTS "userId";
        `);

        // Update categories table
        await queryRunner.query(`
            -- Add clientId column
            ALTER TABLE "categories" ADD COLUMN "clientId" uuid;
            ALTER TABLE "categories" ADD CONSTRAINT "fk_category_client" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE;
            
            -- Update existing categories with data from the user relationship
            UPDATE "categories" c
            SET "clientId" = (
                SELECT cl.id FROM "clients" cl
                JOIN "users" u ON cl."managerId" = u.id
                WHERE u.id = c."userId"
                LIMIT 1
            )
            WHERE c."userId" IS NOT NULL;
            
            -- Drop the user foreign key constraint
            ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "FK_categories_user";
            
            -- Drop the userId column
            ALTER TABLE "categories" DROP COLUMN IF EXISTS "userId";
        `);

        // Insert default roles
        await queryRunner.query(`
            INSERT INTO "roles" (name, description) VALUES 
            ('admin', 'Administrator with full access'),
            ('manager', 'Manager with client management access'),
            ('client', 'Client with limited access');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert categories table changes
        await queryRunner.query(`
            -- Add back userId column
            ALTER TABLE "categories" ADD COLUMN "userId" uuid;
            
            -- Update userId based on client's manager
            UPDATE "categories" c
            SET "userId" = (
                SELECT cl."managerId" FROM "clients" cl
                WHERE cl.id = c."clientId"
            )
            WHERE c."clientId" IS NOT NULL;
            
            -- Add back the foreign key constraint
            ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
            
            -- Drop the client foreign key constraint
            ALTER TABLE "categories" DROP CONSTRAINT "fk_category_client";
            
            -- Drop the clientId column
            ALTER TABLE "categories" DROP COLUMN "clientId";
        `);

        // Revert transactions table changes
        await queryRunner.query(`
            -- Add back userId column
            ALTER TABLE "transactions" ADD COLUMN "userId" uuid;
            
            -- Update userId based on client's manager
            UPDATE "transactions" t
            SET "userId" = (
                SELECT cl."managerId" FROM "clients" cl
                WHERE cl.id = t."clientId"
            )
            WHERE t."clientId" IS NOT NULL;
            
            -- Add back the foreign key constraint
            ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
            
            -- Drop the client foreign key constraint
            ALTER TABLE "transactions" DROP CONSTRAINT "fk_transaction_client";
            
            -- Drop the clientId column
            ALTER TABLE "transactions" DROP COLUMN "clientId";
            
            -- Drop the category foreign key constraint
            ALTER TABLE "transactions" DROP CONSTRAINT "fk_transaction_category";
            
            -- Drop the categoryId column
            ALTER TABLE "transactions" DROP COLUMN "categoryId";
        `);

        // Revert users table changes
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "fk_user_role";
            ALTER TABLE "users" DROP COLUMN "roleId";
        `);

        // Drop auth table
        await queryRunner.query(`DROP TABLE "auth";`);

        // Drop auth_type_enum
        await queryRunner.query(`DROP TYPE "auth_type_enum";`);

        // Drop clients table
        await queryRunner.query(`DROP TABLE "clients";`);

        // Drop marital_status_enum
        await queryRunner.query(`DROP TYPE "marital_status_enum";`);

        // Drop roles table
        await queryRunner.query(`DROP TABLE "roles";`);

        // Drop role_type_enum
        await queryRunner.query(`DROP TYPE "role_type_enum";`);
    }
}
