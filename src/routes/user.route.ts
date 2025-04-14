import express from "express";
import UserController from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";


const router = express.Router();

router.post('/register', UserController.registeredUser);
router.post('/login', UserController.loginUser);
router.get('/', authenticateJWT(["admin"]), UserController.getAllUsers);
router.delete('/:id', authenticateJWT(["admin"]), UserController.deleteUser);

export default router;
