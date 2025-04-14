import Category from "../models/category.entity";

export interface IUser {
    id: number;
    email: string;
    password: string;
    role: string;
    tenant: string;
    categories: Category[]; // One-to-many means it's an array
    createdAt: Date;
    updatedAt: Date;
  }