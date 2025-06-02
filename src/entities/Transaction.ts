import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Category } from "./Category";

export enum TransactionType {
    INCOME = "income",
    EXPENSE = "expense"
}

/**
 * Transaction entity
 */
@Entity("transactions")
export class Transaction {
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

    @ManyToOne(() => Client, client => client.transactions)
    @JoinColumn({ name: "clientId" })
    client: Client;

    @Column()
    clientId: string;

    @ManyToOne(() => Category, category => category.transactions, { nullable: true })
    @JoinColumn({ name: "categoryId" })
    category: Category;

    @Column({ nullable: true })
    categoryId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
