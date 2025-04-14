import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import User from "./user.entity";
import Product from "./product.entity";

@Entity({name: "category"})
export default class Category {
    @PrimaryGeneratedColumn()
        id: number;

    @Column({unique: true})
        name: string;

    @ManyToOne(() => User, user => user.categories)
        createdBy: User;

    // Relation with Product (One category has many products)
    @OneToMany(() => Product, (product) => product.category)
        products: Product[];

    @CreateDateColumn()
        createdAt: Date;

    @UpdateDateColumn()
        updatedAt: Date;
}