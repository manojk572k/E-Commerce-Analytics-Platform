const pool = require("../db/db");

exports.createInventory = async (req, res, next) => {
  const {
    product_id,
    purchased_quantity,
    in_transit_quantity,
    in_stock_quantity,
    low_stock_threshold,
  } = req.body;

  try {
    const productCheck = await pool.query(
      `SELECT id FROM products
       WHERE id = $1 AND user_id = $2`,
      [product_id, req.user.id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found for this user",
      });
    }

    const inventory = await pool.query(
      `INSERT INTO inventory
       (user_id, product_id, purchased_quantity, in_transit_quantity, in_stock_quantity, low_stock_threshold)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        product_id,
        purchased_quantity || 0,
        in_transit_quantity || 0,
        in_stock_quantity || 0,
        low_stock_threshold || 10,
      ]
    );

    res.status(201).json({
      message: "Inventory created successfully",
      inventory: inventory.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await pool.query(
      `SELECT 
          i.id,
          i.product_id,
          p.product_name,
          p.sku,
          i.purchased_quantity,
          i.in_transit_quantity,
          i.in_stock_quantity,
          i.low_stock_threshold,
          CASE
            WHEN i.in_stock_quantity <= i.low_stock_threshold THEN true
            ELSE false
          END AS low_stock_alert,
          i.updated_at
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       WHERE i.user_id = $1
       ORDER BY i.updated_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      count: inventory.rows.length,
      inventory: inventory.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getInventorySummary = async (req, res, next) => {
  try {
    const summary = await pool.query(
      `SELECT
          COUNT(*) AS total_inventory_items,
          COALESCE(SUM(purchased_quantity), 0) AS total_purchased,
          COALESCE(SUM(in_transit_quantity), 0) AS total_in_transit,
          COALESCE(SUM(in_stock_quantity), 0) AS total_in_stock,
          COUNT(*) FILTER (WHERE in_stock_quantity <= low_stock_threshold) AS low_stock_items
       FROM inventory
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.status(200).json({
      summary: summary.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInventory = async (req, res, next) => {
  const {
    product_id,
    purchased_quantity,
    in_transit_quantity,
    in_stock_quantity,
    low_stock_threshold,
  } = req.body;

  try {
    const inventory = await pool.query(
      `UPDATE inventory
       SET product_id = $1,
           purchased_quantity = $2,
           in_transit_quantity = $3,
           in_stock_quantity = $4,
           low_stock_threshold = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        product_id,
        purchased_quantity || 0,
        in_transit_quantity || 0,
        in_stock_quantity || 0,
        low_stock_threshold || 10,
        req.params.id,
        req.user.id,
      ]
    );

    if (inventory.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory record not found",
      });
    }

    res.status(200).json({
      message: "Inventory updated successfully",
      inventory: inventory.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteInventory = async (req, res, next) => {
  try {
    const inventory = await pool.query(
      `DELETE FROM inventory
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (inventory.rows.length === 0) {
      return res.status(404).json({
        message: "Inventory record not found",
      });
    }

    res.status(200).json({
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};