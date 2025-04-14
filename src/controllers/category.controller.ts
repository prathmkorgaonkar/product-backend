import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import Category from "../models/category.entity";
import User from "../models/user.entity";

export default class CategoryController {
    /**
     * @desc    Create a new category
     * @route   POST /api/categories
     * @access  Private (admin/user)
     */
    static createCategory = async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            const userId = req.user?.id;
            console.log(userId);
            
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ id: Number(userId) });

            if (user) {
                const categoryRepo = AppDataSource.getRepository(Category);
                const newCategory = categoryRepo.create({
                    name,
                    createdBy: {id: user.id}
                });

                await categoryRepo.save(newCategory);

                res.status(201).json({ message: "Category created", data: newCategory });
            }

        } catch (err) {
            console.log(err);
            
            res.status(500).json({ message: "Server error", err });
        }
    };

    /**
     * @desc    Get all categories
     * @route   GET /api/categories
     * @access  Private (admin/user)
     */
    static getCategories = async (req: Request, res: Response) => {
        try {
            const categoryRepo = AppDataSource.getRepository(Category);
            const categories = await categoryRepo.find({
                relations: ["createdBy"]
            });

            res.status(200).json(categories);
        } catch (err) {
            res.status(500).json({ message: "Server error", err });
        }
    };

    /**
     * @desc    Update category by ID
     * @route   PUT /api/categories/:id
     * @access  Private (admin only)
     */
    static updateCategory = async (req: Request, res: Response) => {
        try {
            const { name, id } = req.body;
            
            const categoryRepo = AppDataSource.getRepository(Category);
            const category = await categoryRepo.findOne({
                where: { id: Number(id) },
                relations: ["createdBy"]
            });

            if (category) {
                category.name = name;
                await categoryRepo.update(id, category);

                res.status(200).json({ message: "Category updated", data: category });
            }

        } catch (err) {
            res.status(500).json({ message: "Server error", err });
        }
    };

    /**
     * @desc    Delete category by ID
     * @route   DELETE /api/categories/:id
     * @access  Private (admin only)
     */
    static deleteCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.body;

            const categoryRepo = AppDataSource.getRepository(Category);
            const category = await categoryRepo.findOne({
                where: { id: Number(id) },
                relations: ["createdBy"]
            });

            if (category) {
                await categoryRepo.remove(category);

                res.status(200).json({ message: "Category deleted" });
            }

        } catch (err) {
            console.log(err);
            
            res.status(500).json({ message: "Server error", err });
        }
    };
}
