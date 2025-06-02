import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Category } from "./Category";
import { MonthlyBudget } from "./MonthlyBudget";

export enum TransactionType {
    INCOME = "income",
    EXPENSE = "expense"
}

/**
 * DailyTransaction entity - Stores the client's daily transactions
 */
@Entity("daily_transactions")
export class DailyTransaction {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: "enum",
        enum: TransactionType,
        default: TransactionType.EXPENSE
    })
    type: TransactionType;

    @Column({ type: "date" })
    date: Date;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    remainingBalanceAfterTransaction: number;

    @ManyToOne(() => Client, client => client.dailyTransactions)
    @JoinColumn({ name: "clientId" })
    client: Client;

    @Column()
    clientId: string;

    @ManyToOne(() => Category, category => category.dailyTransactions, { nullable: true })
    @JoinColumn({ name: "categoryId" })
    category: Category;

    @Column({ nullable: true })
    categoryId: string;

    @ManyToOne(() => MonthlyBudget, monthlyBudget => monthlyBudget.dailyTransactions)
    @JoinColumn({ name: "monthlyBudgetId" })
    monthlyBudget: MonthlyBudget;

    @Column()
    monthlyBudgetId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
