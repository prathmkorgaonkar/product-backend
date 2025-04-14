// middleware/imageUpload.ts
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import * as dotenv from "dotenv";
import { Request, Response, NextFunction } from 'express';

dotenv.config();

// Set storage location
const uploadPath = `${process.env.FILE_LOCATION}upload/productImage`;

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only image files are allowed") as unknown as null, false);
        }
        cb(null, true);
    }
});

// Middleware for single image upload and inject filename into req.body.image
const imageUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const singleUpload = upload.single('image');

    singleUpload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (req.file) {
            req.body.image = req.file.filename;
        }

        next();
    });
};

export default imageUploadMiddleware;
