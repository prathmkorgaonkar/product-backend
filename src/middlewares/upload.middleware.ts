import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, //5MB
    fileFilter: (req, file, cb) => {
        const allowTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!allowTypes.includes(file.mimetype)) {
            return cb(new Error("Only CSV or XLSX files are allowed") as unknown as null, false);
        }
        cb(null, true);
    }
});

export default upload;
