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

    @OneToMany(() => DailyTransaction, dailyTransaction => dailyTransaction.category, { nullable: true })
    dailyTransactions: DailyTransaction[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
