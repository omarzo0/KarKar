const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/admin/login", authLimiter);

// Logging
app.use(morgan("combined")); // Use 'dev' for development, 'combined' for production

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files (if needed)
app.use("/uploads", express.static("uploads"));

// Routes
const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const transactionsRoutes = require("./src/routes/transactionRoutes");

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/transactions", transactionsRoutes);

// Health check with detailed status
app.get("/health", async (req, res) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: "Unknown",
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.database = "Connected";

      // Add some basic stats if needed
      const User = require("./src/models/User");
      const Product = require("./src/models/Product");
      const Order = require("./src/models/Order");

      const [userCount, productCount, orderCount] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
      ]);

      healthCheck.stats = {
        users: userCount,
        products: productCount,
        orders: orderCount,
      };
    } else {
      healthCheck.database = "Disconnected";
      healthCheck.status = "WARNING";
    }
  } catch (error) {
    healthCheck.database = "Error";
    healthCheck.status = "ERROR";
    healthCheck.error = error.message;
  }

  res.status(healthCheck.status === "OK" ? 200 : 503).json(healthCheck);
});

// API info endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🛍️ E-Commerce API Server",
    version: "1.0.0",
    documentation: "/api/docs", // You can add Swagger docs later
    endpoints: {
      auth: {
        user: "/api/users",
        admin: "/api/admin",
      },
      resources: {
        products: "/api/products",
        orders: "/api/orders",
        cart: "/api/cart",
        payments: "/api/payments",
        analytics: "/api/analytics",
      },
    },
    health: "/health",
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("🚫 Global Error Handler:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("🚫 Unhandled Promise Rejection:", err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("🚫 Uncaught Exception:", err);
  process.exit(1);
});

// MongoDB connection with better error handling and retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);

    // MongoDB connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("🚫 MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });
  } catch (error) {
    console.error("🚫 Failed to connect to MongoDB:", error.message);

    // Retry connection after 5 seconds
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("🛑 Received shutdown signal, closing server...");

  mongoose.connection.close(false, () => {
    console.log("✅ MongoDB connection closed.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Initialize database connection and start server
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });

  // Handle server errors
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`🚫 Port ${PORT} is already in use`);
    } else {
      console.error("🚫 Server error:", error);
    }
    process.exit(1);
  });
};

// Start the server
startServer();

module.exports = app;
