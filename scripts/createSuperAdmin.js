// scripts/createSuperAdmin.js
// Run with: node scripts/createSuperAdmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    enum: ["admin"],
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

// Super Admin Details - CHANGE THESE!
const SUPER_ADMIN = {
  username: "omar",
  email: "omarkhaled202080@gmail.com",
  password: "SuperAdmin@123", // Change this in production!
  firstName: "omar",
  lastName: "khaled",
  phone: "+201002020455",
};

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { email: SUPER_ADMIN.email },
        { username: SUPER_ADMIN.username },
      ],
    });

    if (existingAdmin) {
      console.log("⚠️  Super admin already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, salt);

    // Create admin with ALL permissions
    const superAdmin = new Admin({
      username: SUPER_ADMIN.username,
      email: SUPER_ADMIN.email,
      password: hashedPassword,
      profile: {
        firstName: SUPER_ADMIN.firstName,
        lastName: SUPER_ADMIN.lastName,
        phone: SUPER_ADMIN.phone,
      },
      role: "admin",
      permissions: {
        canManageUsers: true,
        canManageProducts: true,
        canManageOrders: true,
        canManageInventory: true,
        canViewAnalytics: true,
        canManagePayments: true,
        canManageAdmins: true,
        canManageSettings: true,
      },
      isActive: true,
    });

    await superAdmin.save();

    console.log("\n🎉 Admin created successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  📧 Email:    " + SUPER_ADMIN.email);
    console.log("  👤 Username: " + SUPER_ADMIN.username);
    console.log("  🔑 Password: " + SUPER_ADMIN.password);
    console.log("  👑 Role:     admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating super admin:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSuperAdmin();
