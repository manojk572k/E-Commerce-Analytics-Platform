const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  validateProduct,
} = require("../middleware/validateProduct");

router.post("/", protect, validateProduct, createProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.put("/:id", protect, validateProduct, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;