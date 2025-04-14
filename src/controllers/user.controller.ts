import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import User from "../models/user.entity";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../middlewares/auth.middleware";

export default class UserController {
    /**
     * @desc    Register a new user
     * @route   POST /api/users/register
     * @access  Public
     */
    static registeredUser = async (req: Request, res: Response) => {
        try {
            const { email, password, role } = req.body;

            const userRepo = AppDataSource.getRepository(User);
            const existing = await userRepo.findOne({ where: { email } });

            if (existing) {
                res.status(400).json({ message: "User already exists" });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = userRepo.create({ email, password: hashedPassword, role });

                await userRepo.save(user);
                res.status(201).json({ message: "User registered successfully" });
            }

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };
    /**
     * @desc    Login a user and return JWT token
     * @route   POST /api/users/login
     * @access  Public
     */
    static loginUser = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOne({ where: { email } });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.status(401).json({ message: "Invalid credentials" });
            } else {
                const token = generateToken({ id: user.id, email: user.email, role: user.role });
                res.status(200).json({ token });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };

    /**
     * @desc    Get all users (admin only)
     * @route   GET /api/users
     * @access  Private (Admin only)
     */
    static getAllUsers = async (req: Request, res: Response) => {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const users = await userRepo.find();
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };

    /**
     * @desc    Delete a user by ID (admin only)
     * @route   DELETE /api/users/:id
     * @access  Private (Admin only)
     */
    static deleteUser = async (req: Request, res: Response) => {
        try {
            const userRepo = AppDataSource.getRepository(User);
            await userRepo.delete(req.params.id);
            res.json({ message: "User deleted" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };
}
