const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        console.log('Filtering file:', file.originalname, file.mimetype);
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        console.error('File filtered out:', file.originalname, file.mimetype);
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
    }
});

// Upload Single File
router.post('/', authMiddleware, roleMiddleware(['farmer', 'admin']), (req, res, next) => {
    console.log('Upload request received');
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Multer error: ${err.message}` });
            }
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        }

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File uploaded successfully:', req.file.filename);
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    });
});

module.exports = router;