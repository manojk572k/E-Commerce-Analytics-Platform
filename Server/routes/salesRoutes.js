const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createSale,
  getSales,
  getSalesSummary,
} = require("../controllers/salesController");

const {
  validateSale,
} = require("../middleware/validateSales");

router.post("/", protect, validateSale, createSale);
router.get("/", protect, getSales);
router.get("/summary", protect, getSalesSummary);

module.exports = router;