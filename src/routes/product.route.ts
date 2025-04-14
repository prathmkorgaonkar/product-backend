import express from "express";
import ProductController from "../controllers/product.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";
import imageUploadMiddleware from "../middlewares/imageUpload.middleware";

const router = express.Router();

router.post("/", authenticateJWT(["admin", "user"]), imageUploadMiddleware, ProductController.createProduct);

router.get("/", authenticateJWT(["admin", "user"]), ProductController.getProducts);

router.post("/updateProduct", authenticateJWT(["admin"]), ProductController.updateProduct);

router.post("/deleteProduct", authenticateJWT(["admin"]), ProductController.deleteProduct);

// Bulk upload
router.post("/bulkUpload", authenticateJWT(["admin"]), upload.single("file"), ProductController.bulkUpload);

// Download product report
router.get("/report", authenticateJWT(["admin", "user"]), ProductController.downloadReport);


export default router;
