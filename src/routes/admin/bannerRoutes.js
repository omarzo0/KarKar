const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");

const {
  validateBannerId,
  validateCreateBanner,
  validateUpdateBanner,
  validateBannerQuery,
  validateReorderBanners,
  validateBulkDelete,
  validateBulkUpdateStatus,
} = require("../../validations/admin/bannerValidation");

const {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
  bulkDeleteBanners,
  bulkUpdateStatus,
} = require("../../controllers/admin/bannerController");

// All routes require admin authentication
router.use(adminAuth);

// Get all banners
router.get(
  "/",
  validateBannerQuery,
  getAllBanners
);

// Create banner
router.post(
  "/",
  validateCreateBanner,
  createBanner
);

// Reorder banners
router.put(
  "/reorder",
  validateReorderBanners,
  reorderBanners
);

// Bulk delete banners
router.delete(
  "/bulk",
  validateBulkDelete,
  bulkDeleteBanners
);

// Bulk update banner status
router.patch(
  "/bulk/status",
  validateBulkUpdateStatus,
  bulkUpdateStatus
);

// Get single banner
router.get(
  "/:bannerId",
  validateBannerId,
  getBannerById
);

// Update banner
router.put(
  "/:bannerId",
  validateUpdateBanner,
  updateBanner
);

// Delete banner
router.delete(
  "/:bannerId",
  validateBannerId,
  deleteBanner
);

// Toggle banner status
router.patch(
  "/:bannerId/toggle",
  validateBannerId,
  toggleBannerStatus
);

module.exports = router;
