# 🛠️ E-Commerce Admin Backend

This is a backend application for an E-commerce Admin Panel built using **Node.js**, **Express**, **TypeORM**, and **PostgreSQL**. It supports user authentication, RBAC (Role-Based Access Control), and modules for managing Products and Categories with features like:

- CRUD operations
- Bulk upload (CSV/XLSX)
- Report downloads (CSV/XLSX/ZIP)
- Server-side pagination, search & sort

---

## 📦 Tech Stack

- **Node.js** v18.17.1
- **Express.js**
- **TypeORM**
- **PostgreSQL**
- **JWT Authentication**
- **RBAC (Role-Based Access Control)**
- **Multer** (for file upload)
- **ExcelJS**, **csv-parse**, **xlsx**, **archiver** (for reports)

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js v18.17.1
- PostgreSQL installed and running


### 📁 Project Structure

src/ ├── controllers/
     ├── entities/ 
     ├── middlewares/ 
     ├── routes/ 
     ├── utils/
     |── config/
    ----app.ts

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure:
PORT=5000 
DB_HOST=localhost 
DB_PORT=5432 
DB_USERNAME=postgres 
DB_PASSWORD=yourpassword 
DB_NAME=ecommerce 
JWT_SECRET=your_jwt_secret


# Install dependencies
npm install

# Clone the repository
https://github.com/prathmkorgaonkar/product-backend.git

