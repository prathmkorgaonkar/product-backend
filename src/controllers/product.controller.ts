import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import Product from "../models/product.entity";
import Category from "../models/category.entity";
import { In } from "typeorm";
import fs from "fs";
import { parse } from "csv-parse"
import * as streamifier from 'streamifier';
import * as ExcelJS from "exceljs";
import archiver from "archiver";
import * as XLSX from "xlsx";

export default class ProductController {
    /**
     * @desc    Create a product (only if category belongs to user)
     * @route   POST /api/products
     * @access  Private (Admin/User)
     */
    static createProduct = async (req: Request, res: Response) => {
        try {
            const { name, image, price, categoryId } = req.body;
            console.log(req.body);

            const userId = req.user?.id;

            const categoryRepo = AppDataSource.getRepository(Category);
            const category = await categoryRepo.findOne({
                where: { id: categoryId, createdBy: { id: userId } },
                relations: ["createdBy"]
            });
            console.log("CATE  ", category);

            if (!category) {
                res.status(403).json({ message: "Access denied. Category not found or not owned by you." });
            } else {
                const productRepo = AppDataSource.getRepository(Product);
                const product = productRepo.create({ name, image, price, category });
                await productRepo.save(product);
                res.status(201).json({ message: "Product created successfully", product });
            }
        } catch (err) {
            console.log(err);

            res.status(500).json({ message: "Server error", err });
        }
    };

    /**
     * @desc    Get paginated, searchable, and sorted products created by user (via category)
     * @route   GET /api/products
     * @access  Private (Admin/User)
     */
    static getProducts = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;

            // Get filters
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = String(req.query.search || "").toLowerCase();
            const sort = req.query.sort === "desc" ? "DESC" : "ASC";
            const skip = (page - 1) * limit;

            // Get all category IDs of the current user
            const categoryRepo = AppDataSource.getRepository(Category);
            const userCategories = await categoryRepo.find({
                where: { createdBy: { id: userId } }
            });
            const categoryIds = userCategories.map(cat => cat.id);

            const productRepo = AppDataSource.getRepository(Product);
            const [products, total] = await productRepo.findAndCount({
                where: {
                    category: {
                        id: In(categoryIds),
                        name: search ? In([search]) : undefined
                    },
                    name: search ? In([search]) : undefined
                },
                relations: ["category"],
                skip,
                take: limit,
                order: { price: sort }
            });

            res.status(200).json({
                data: products,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            });
        } catch (err) {
            res.status(500).json({ message: "Server error", err });
        }
    };

    /**
     * @desc    Update a product if it belongs to user’s category
     * @route   PUT /api/products/:id
     * @access  Private (Admin only)
     */
    static updateProduct = async (req: Request, res: Response) => {
        try {
            const { name, image, price, id } = req.body;
            const userId = req.user?.id;
            console.log(req.body, userId);

            const productRepo = AppDataSource.getRepository(Product);
            const product = await productRepo.findOne({
                where: { id: id },
                relations: ["category", "category.createdBy"]
            });
            console.log("PRODUCT == ", product);

            if (!product || product.category.createdBy.id !== userId) {
                res.status(403).json({ message: "Access denied. Product not found or not owned by you." });
            } else {
                product.name = name;
                product.price = price;

                await productRepo.update(id, product);
                res.status(200).json({ message: "Product updated", product });
            }
        } catch (err) {
            console.log("ERR ", err);

            res.status(500).json({ message: "Server error", err });
        }
    };

    /**
     * @desc    Delete a product (only if belongs to user's category)
     * @route   DELETE /api/products/:id
     * @access  Private (Admin only)
     */
    static deleteProduct = async (req: Request, res: Response) => {
        try {
            const { id } = req.body;
            const userId = req.user?.id;

            const productRepo = AppDataSource.getRepository(Product);
            const product = await productRepo.findOne({
                where: { id },
                relations: ["category", "category.createdBy"]
            });

            if (!product || product.category.createdBy.id !== userId) {
                res.status(403).json({ message: "Access denied. Product not found or not owned by you." });
            } else {
                await productRepo.remove(product);
                res.status(200).json({ message: "Product deleted" });
            }
        } catch (err) {
            console.log(err);

            res.status(500).json({ message: "Server error", err });
        }
    };

    /**
     * @desc    Bulk upload products from CSV (must belong to user's categories)
     * @route   POST /api/products/bulk-upload
     * @access  Private (Admin/User)
     */
    static bulkUpload = async (req: Request, res: Response) => {
        try {
            const file = req.file;
            const userId = req.user?.id;

            if (file) {
                const productRepo = AppDataSource.getRepository(Product);
                const categoryRepo = AppDataSource.getRepository(Category);

                // Load all user-created categories and create a lookup map
                const userCategories = await categoryRepo.find({
                    where: { createdBy: { id: userId } },
                });

                const categoryMap = new Map<number, Category>();
                userCategories.forEach((cat) => categoryMap.set(cat.id, cat));

                // Common setup for bulk insert
                const batchSize = 100;
                const productsBatch: Product[] = [];
                let totalInserted = 0;
                let skippedRows: string[] = [];

                const fileExt = file.originalname.split(".").pop()?.toLowerCase();

                let rows: any[] = [];

                // 🟡 Parse based on file extension
                if (fileExt === "csv") {
                    const parser = streamifier.createReadStream(file.buffer).pipe(
                        parse({ columns: true, trim: true })
                    );

                    for await (const row of parser) {
                        rows.push(row);
                    }

                } else if (fileExt === "xlsx") {
                    const workbook = XLSX.read(file.buffer, { type: "buffer" });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(firstSheet);
                } else {
                    res.status(400).json({ message: "Unsupported file format. Only .csv or .xlsx allowed." });
                }

                // 🟢 Process rows after parsing
                for (const row of rows) {
                    const categoryId = Number(row.categoryId);

                    if (isNaN(categoryId) || !categoryMap.has(categoryId)) {
                        skippedRows.push(JSON.stringify(row));
                        continue;
                    }

                    const product = productRepo.create({
                        name: row.name,
                        price: parseFloat(row.price),
                        image: row.image,
                        category: categoryMap.get(categoryId),
                    });

                    productsBatch.push(product);

                    if (productsBatch.length === batchSize) {
                        await productRepo.save(productsBatch);
                        totalInserted += productsBatch.length;
                        productsBatch.length = 0;
                    }
                }

                // Save any remaining records
                if (productsBatch.length > 0) {
                    await productRepo.save(productsBatch);
                    totalInserted += productsBatch.length;
                }

                // Final response
                res.status(201).json({
                    message: "Bulk upload successful",
                    totalInserted,
                    skippedRowsCount: skippedRows.length
                });

            } else {
                res.status(400).json({ message: "No file uploaded" });
            }

        } catch (error) {
            console.error("Bulk upload error:", error);
            res.status(500).json({ message: "Bulk upload failed", error });
        }
    };
    /**
     * @desc    Download product report as Excel (products belonging to user's categories)
     * @route   GET /api/products/report
     * @access  Private (Admin/User)
     */
    static downloadReport = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;

            // Fetch all products for the current user
            const productRepo = AppDataSource.getRepository(Product);
            const products = await productRepo.find({
                where: {
                    category: {
                        createdBy: { id: userId }
                    }
                },
                relations: ["category"]
            });

            //Create an Excel workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Products");

            // Define Excel column headers
            sheet.columns = [
                { header: "Name", key: "name", width: 30 },
                { header: "Price", key: "price", width: 15 },
                { header: "Category", key: "category", width: 30 },
                { header: "Image", key: "image", width: 40 },
            ];

            // Add product data to Excel sheet
            products.forEach(product => {
                sheet.addRow({
                    name: product.name,
                    price: product.price,
                    category: product.category.name,
                    image: product.image
                });
            });

            // Create CSV content as a string
            let csvData = "Name,Price,Category,Image\n";
            for (const p of products) {
                csvData += `"${p.name}",${p.price},"${p.category.name}","${p.image}"\n`;
            }

            // Set response headers for zip download
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachment; filename=product-report.zip");

            // Create zip archive
            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(res); // Pipe archive directly to response

            // Add Excel file to archive
            const excelBuffer = await workbook.xlsx.writeBuffer();
            archive.append(Buffer.from(excelBuffer), { name: "products.xlsx" }); // Convert excelBuffer to Buffer

            // Add CSV file to archive
            archive.append(csvData, { name: "product-report.csv" });

            // Finalize and send the archive
            await archive.finalize();

        } catch (error) {
            console.error("Report generation error:", error);
            res.status(500).json({ message: "Error generating report", error });
        }
    };
}
