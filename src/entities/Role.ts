import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

/**
 * Enum for role types
 */
export enum RoleType {
  ADMIN = "admin",
  MANAGER = "manager",
  CLIENT = "client"
}

/**
 * Role entity for access control
 */
@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: RoleType,
    default: RoleType.CLIENT
  })
  name: RoleType;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
