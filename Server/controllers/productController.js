const pool = require("../db/db");

exports.createProduct = async (req, res, next) => {
  const {
    product_name,
    sku,
    category,
    supplier,
    cost_price,
    selling_price,
  } = req.body;

  try {
    const product = await pool.query(
      `INSERT INTO products 
       (user_id, product_name, sku, category, supplier, cost_price, selling_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        product_name,
        sku,
        category || null,
        supplier || null,
        cost_price || 0,
        selling_price || 0,
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: product.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "SKU already exists for this user",
      });
    }

    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await pool.query(
      `SELECT * FROM products
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      count: products.rows.length,
      products: products.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await pool.query(
      `SELECT * FROM products
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      product: product.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  const {
    product_name,
    sku,
    category,
    supplier,
    cost_price,
    selling_price,
  } = req.body;

  try {
    const product = await pool.query(
      `UPDATE products
       SET product_name = $1,
           sku = $2,
           category = $3,
           supplier = $4,
           cost_price = $5,
           selling_price = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        product_name,
        sku,
        category || null,
        supplier || null,
        cost_price || 0,
        selling_price || 0,
        req.params.id,
        req.user.id,
      ]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: product.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await pool.query(
      `DELETE FROM products
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};