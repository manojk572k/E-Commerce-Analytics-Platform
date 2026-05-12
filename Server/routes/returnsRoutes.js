const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createReturn,
  getReturns,
  getReturnsSummary,
} = require("../controllers/returnsController");

const {
  validateReturn,
} = require("../middleware/validateReturns");

router.post("/", protect, validateReturn, createReturn);
router.get("/", protect, getReturns);
router.get("/summary", protect, getReturnsSummary);

module.exports = router;