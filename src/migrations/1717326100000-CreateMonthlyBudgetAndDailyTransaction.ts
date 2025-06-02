import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMonthlyBudgetAndDailyTransaction1717326100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create monthly_budgets table
        await queryRunner.query(`
            CREATE TABLE "monthly_budgets" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "year" integer NOT NULL,
                "month" integer NOT NULL,
                "monthlySalary" decimal(10,2) NOT NULL DEFAULT 0,
                "budgetAmount" decimal(10,2) NOT NULL DEFAULT 0,
                "isPercentage" boolean NOT NULL DEFAULT false,
                "dailyBudget" decimal(10,2) NOT NULL DEFAULT 0,
                "remainingBalance" decimal(10,2) NOT NULL DEFAULT 0,
                "daysInMonth" integer NOT NULL,
                "clientId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_monthly_budgets_clients" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE
            );
        `);

        // Create daily_transactions table
        await queryRunner.query(`
            CREATE TYPE "daily_transactions_type_enum" AS ENUM ('income', 'expense');
            
            CREATE TABLE "daily_transactions" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "description" varchar(255) NOT NULL,
                "amount" decimal(10,2) NOT NULL,
                "type" "daily_transactions_type_enum" NOT NULL DEFAULT 'expense',
                "date" date NOT NULL,
                "remainingBalanceAfterTransaction" decimal(10,2) NOT NULL DEFAULT 0,
                "clientId" uuid NOT NULL,
                "categoryId" uuid,
                "monthlyBudgetId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_daily_transactions_clients" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_daily_transactions_categories" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_daily_transactions_monthly_budgets" FOREIGN KEY ("monthlyBudgetId") REFERENCES "monthly_budgets"("id") ON DELETE CASCADE
            );
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_monthly_budgets_client_year_month" ON "monthly_budgets" ("clientId", "year", "month");
            CREATE INDEX "IDX_daily_transactions_client_date" ON "daily_transactions" ("clientId", "date");
            CREATE INDEX "IDX_daily_transactions_monthly_budget" ON "daily_transactions" ("monthlyBudgetId");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_daily_transactions_monthly_budget"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_daily_transactions_client_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_monthly_budgets_client_year_month"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "daily_transactions"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "daily_transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "monthly_budgets"`);
    }
}
