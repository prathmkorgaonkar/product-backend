// src/routes/category.routes.ts
import express from "express";
import CategoryController from "../controllers/category.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = express.Router();

// Create category - admin or user
router.post("/", authenticateJWT(["admin", "user"]), CategoryController.createCategory);

// Get all categories for a tenant
router.get("/", authenticateJWT(["admin", "user"]), CategoryController.getCategories);

// Update category using POST (custom route name to avoid conflict)
router.post("/updateCategory", authenticateJWT(["admin"]), CategoryController.updateCategory);

// Delete category using POST (custom route name to avoid conflict)
router.post("/deleteCategory", authenticateJWT(["admin"]), CategoryController.deleteCategory);

export default router;
