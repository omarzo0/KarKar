const express = require("express");
const router = express.Router();
const upload = require("../../middleware/uploadMiddleware");
const { adminAuth } = require("../../middleware/adminAuth");

// @desc    Upload image
// @route   POST /api/upload
// @access  Private (Admin or Authenticated User)
router.post("/", adminAuth, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file",
            });
        }

        // Return the relative path
        const filePath = req.file.path;

        res.status(200).json({
            success: true,
            data: {
                path: filePath,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during upload",
            error: error.message
        });
    }
});

// Bulk upload
router.post("/bulk", adminAuth, upload.array("images", 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload files",
            });
        }

        const filePaths = req.files.map(file => file.path);

        res.status(200).json({
            success: true,
            data: {
                paths: filePaths,
                count: filePaths.length
            },
        });
    } catch (error) {
        console.error("Bulk upload error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during bulk upload",
            error: error.message
        });
    }
});

module.exports = router;
