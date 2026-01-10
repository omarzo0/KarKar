const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = "uploads";

        // Determine folder based on request type or body
        if (req.body.type === "product") folder += "/products";
        else if (req.body.type === "banner") folder += "/banners";
        else if (req.body.type === "category") folder += "/categories";
        else if (req.body.type === "avatar") folder += "/avatars";

        // Create folder if it doesn't exist
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        cb(null, folder);
    },
    filename: function (req, file, cb) {
        // Clean filename: timestamp + original extension
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|webp|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Images Only (jpeg, jpg, png, webp, gif)!"));
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
