const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createInventory,
  getInventory,
  getInventorySummary,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

const {
  validateInventory,
} = require("../middleware/validateInventory");

router.post("/", protect, validateInventory, createInventory);
router.get("/", protect, getInventory);
router.get("/summary", protect, getInventorySummary);
router.put("/:id", protect, validateInventory, updateInventory);
router.delete("/:id", protect, deleteInventory);

module.exports = router;