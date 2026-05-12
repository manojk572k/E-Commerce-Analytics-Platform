const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProfitLoss,
  getProfitLossSummary,
} = require("../controllers/profitLossController");

router.get("/", protect, getProfitLoss);
router.get("/summary", protect, getProfitLossSummary);

module.exports = router;