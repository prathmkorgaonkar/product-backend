import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import Category from "./category.entity";

@Entity({ name: "product"})
export default class Product{
    @PrimaryGeneratedColumn()
        id: number;

    @Column()
        name: string;
    
    @Column()
        image: string;

    @Column('decimal')
        price: number;

    //RelationShip: product belongs to a category
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: "categoryId"})
    category: Category;

    @Column()
        categoryId: number;

    @CreateDateColumn()
        createdAt: Date;

    @UpdateDateColumn()
        updatedAt: Date;
}