import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1717403362000 implements MigrationInterface {
    name = 'InitialMigration1717403362000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create categories table
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "color" character varying,
                "icon" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_categories" PRIMARY KEY ("id")
            )
        `);

        // Create transaction type enum
        await queryRunner.query(`
            CREATE TYPE "public"."transactions_type_enum" AS ENUM('income', 'expense')
        `);

        // Create transactions table
        await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "description" character varying NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "type" "public"."transactions_type_enum" NOT NULL DEFAULT 'expense',
                "date" date NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "categoryId" uuid,
                CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "categories" 
            ADD CONSTRAINT "FK_categories_users" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "FK_transactions_users" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ADD CONSTRAINT "FK_transactions_categories" 
            FOREIGN KEY ("categoryId") 
            REFERENCES "categories"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_categories"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_users"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_users"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
