import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Client } from "./Client";

/**
 * Enum for authentication types
 */
export enum AuthType {
  USER = "user",
  CLIENT = "client"
}

/**
 * Auth entity for authentication
 */
@Entity("auth")
export class Auth {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: "enum",
    enum: AuthType,
    default: AuthType.CLIENT
  })
  type: AuthType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  refreshTokenExpiry: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: "clientId" })
  client: Client;

  @Column({ nullable: true })
  clientId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
