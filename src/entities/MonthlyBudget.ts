import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from "typeorm";
import { Client } from "./Client";
import { DailyTransaction } from "./DailyTransaction";

/**
 * MonthlyBudget entity - Stores the client's monthly budget information
 */
@Entity("monthly_budgets")
export class MonthlyBudget {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "int" })
    year: number;

    @Column({ type: "int" })
    month: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    monthlySalary: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    budgetAmount: number;

    @Column({ type: "boolean", default: false })
    isPercentage: boolean;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    dailyBudget: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    remainingBalance: number;

    @Column({ type: "int" })
    daysInMonth: number;

    @ManyToOne(() => Client, client => client.monthlyBudgets)
    @JoinColumn({ name: "clientId" })
    client: Client;

    @Column()
    clientId: string;

    @OneToMany(() => DailyTransaction, dailyTransaction => dailyTransaction.monthlyBudget)
    dailyTransactions: DailyTransaction[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
