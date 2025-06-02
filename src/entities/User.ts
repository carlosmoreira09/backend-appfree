import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Role } from "./Role";
import { Client } from "./Client";

/**
 * User entity - represents system users (managers/admins)
 */
@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Role)
    @JoinColumn({ name: "roleId" })
    role: Role;

    @Column({ nullable: true })
    roleId: string;

    @OneToMany(() => Client, client => client.manager)
    clients: Client[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
