const multer = require('multer');
const path = require('path');
const fs = require('fs');

const os = require('os');

// Ensure upload directory exists
// On Vercel, we must use /tmp
const isVercel = process.env.VERCEL;
const uploadDir = isVercel
    ? path.join(os.tmpdir(), 'uploads')
    : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.warn('Warning: Could not create upload directory:', err.message);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allow all files for now to debug "image not allowed" error
        // Verify mimetype later if strictly needed
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
