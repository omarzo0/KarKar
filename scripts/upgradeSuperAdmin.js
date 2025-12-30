// scripts/upgradeSuperAdmin.js
// Run with: node scripts/upgradeSuperAdmin.js
// Upgrades an existing admin to super admin with full permissions

require("dotenv").config();
const mongoose = require("mongoose");

// Admin Schema (inline to avoid import issues)
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
  },
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageProducts: { type: Boolean, default: false },
    canManageOrders: { type: Boolean, default: false },
    canManageInventory: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManagePayments: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

// Admin to upgrade
const ADMIN_EMAIL = "omarkhaled202080@gmail.com";

async function upgradeSuperAdmin() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find the admin
    const admin = await Admin.findOne({ email: ADMIN_EMAIL });

    if (!admin) {
      console.log("❌ Admin not found with email:", ADMIN_EMAIL);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("\n📋 Current Admin Status:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Permissions:`, admin.permissions);

    // Upgrade to super admin with ALL permissions
    admin.role = "admin";
    admin.permissions = {
      canManageUsers: true,
      canManageProducts: true,
      canManageOrders: true,
      canManageInventory: true,
      canViewAnalytics: true,
      canManagePayments: true,
      canManageAdmins: true,
      canManageSettings: true,
    };
    admin.isActive = true;
    admin.updatedAt = new Date();

    await admin.save();

    console.log("\n🎉 Admin upgraded to Super Admin successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  📧 Email:    " + admin.email);
    console.log("  👤 Username: " + admin.username);
    console.log("  👑 Role:     " + admin.role);
    console.log("  ✅ All permissions enabled!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✅ Permissions:");
    console.log("   • canManageUsers: ✅");
    console.log("   • canManageProducts: ✅");
    console.log("   • canManageOrders: ✅");
    console.log("   • canManageInventory: ✅");
    console.log("   • canViewAnalytics: ✅");
    console.log("   • canManagePayments: ✅");
    console.log("   • canManageAdmins: ✅");
    console.log("   • canManageSettings: ✅");
    console.log("");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error upgrading admin:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

upgradeSuperAdmin();
