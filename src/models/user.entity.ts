import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import Category from "./category.entity";

@Entity({name: "user"})
export  default class User {
    @PrimaryGeneratedColumn()
        id: number;

    @Column({unique: true})
        email: string;

    @Column()
        password: string;

    @Column()
        role: string;

    @OneToMany(() => Category, category => category.createdBy)
    categories: Category;

    @CreateDateColumn()
        createdAt: Date;

    @UpdateDateColumn()
        updatedAt: Date;
}