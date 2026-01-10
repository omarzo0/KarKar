const express = require("express");
const router = express.Router();
const {
  adminAuth,
} = require("../../middleware/adminAuth");

const {
  getDashboardOverview,
} = require("../../controllers/admin/dashboardController");

router.use(adminAuth);

router.get("/", getDashboardOverview);

module.exports = router;
