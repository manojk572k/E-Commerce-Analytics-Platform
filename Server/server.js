const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorMiddleware");

// Initialize DB connection
require("./db/db");

const app = express();

// Security middleware
app.use(helmet());

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "E-Commerce Analytics Backend is running",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});