const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/userAuth");

const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updatePreferences,
  uploadAvatar,
  deleteAccount,
  getUserActivity,
  reactivateAccount,
  // Address book
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  // Recently viewed
  getRecentlyViewed,
  clearRecentlyViewed,
  // Compare products
  getCompareList,
  toggleCompareProduct,
  clearCompareList,
  // Account deletion
  requestAccountDeletion,
  cancelDeletionRequest,
} = require("../../controllers/user/profileController");

const {
  validateUpdateProfile,
  validateChangePassword,
  validatePreferences,
  validateDeleteAccount,
  validateReactivateAccount,
  validateAddAddress,
  validateUpdateAddress,
  validateSetDefaultAddress,
  validateDeletionRequest,
} = require("../../validations/user/profileValidation");

// Public route (for account reactivation - must be before userAuth middleware)
router.post("/reactivate", validateReactivateAccount, reactivateAccount);

// Protected routes (require user authentication)
router.use(userAuth);

// Basic profile routes
router.get("/", getUserProfile);
router.put("/", validateUpdateProfile, updateUserProfile);
router.put("/password", validateChangePassword, changePassword);
router.put("/preferences", validatePreferences, updatePreferences);
router.post("/avatar", uploadAvatar);
router.delete("/", validateDeleteAccount, deleteAccount);
router.get("/activity", getUserActivity);

// Address book routes
router.get("/addresses", getAddresses);
router.post("/addresses", validateAddAddress, addAddress);
router.put("/addresses/:addressId", validateUpdateAddress, updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.put("/addresses/:addressId/default", validateSetDefaultAddress, setDefaultAddress);

// Recently viewed products routes
router.get("/recently-viewed", getRecentlyViewed);
router.delete("/recently-viewed", clearRecentlyViewed);

// Compare products routes
router.get("/compare", getCompareList);
router.post("/compare/:productId", toggleCompareProduct);
router.delete("/compare", clearCompareList);

// Account deletion request routes
router.post("/request-deletion", validateDeletionRequest, requestAccountDeletion);
router.delete("/request-deletion", cancelDeletionRequest);

module.exports = router;
