import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Transaction } from "./Transaction";
import { Category } from "./Category";
import { User } from "./User";
import { MonthlyBudget } from "./MonthlyBudget";
import { DailyTransaction } from "./DailyTransaction";

/**
 * Enum for marital status
 */
export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
  OTHER = "other"
}

/**
 * Client entity
 */
@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salary: number;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  zipCode: string;

  @Column({ length: 255, nullable: true })
  complement: string;

  @Column({
    type: "enum",
    enum: MaritalStatus,
    default: MaritalStatus.SINGLE
  })
  maritalStatus: MaritalStatus;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: "managerId" })
  manager: User;

  @Column({ nullable: true })
  managerId: string;

  @OneToMany(() => Transaction, transaction => transaction.client)
  transactions: Transaction[];

  @OneToMany(() => Category, category => category.client)
  categories: Category[];

  @OneToMany(() => MonthlyBudget, monthlyBudget => monthlyBudget.client)
  monthlyBudgets: MonthlyBudget[];

  @OneToMany(() => DailyTransaction, dailyTransaction => dailyTransaction.client)
  dailyTransactions: DailyTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
