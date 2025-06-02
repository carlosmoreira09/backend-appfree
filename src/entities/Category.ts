import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Transaction } from "./Transaction";
import { DailyTransaction } from "./DailyTransaction";

/**
 * Category entity
 */
@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    color: string;

    @Column({ nullable: true })
    icon: string;

    @ManyToOne(() => Client, client => client.categories)
    @JoinColumn({ name: "clientId" })
    client: Client;

    @Column()
    clientId: string;

    @OneToMany(() => Transaction, transaction => transaction.category)
    transactions: Transaction[];

    @OneToMany(() => DailyTransaction, dailyTransaction => dailyTransaction.category)
    dailyTransactions: DailyTransaction[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
