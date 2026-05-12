const pool = require("../db/db");

exports.createSale = async (req, res, next) => {
  const {
    product_id,
    quantity_sold,
    revenue,
    platform_fee,
    shipping_cost,
    tax_amount,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productCheck = await client.query(
      `SELECT id FROM products
       WHERE id = $1 AND user_id = $2`,
      [product_id, req.user.id]
    );

    if (productCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Product not found for this user",
      });
    }

    const sale = await client.query(
      `INSERT INTO sales
       (user_id, product_id, quantity_sold, revenue, platform_fee, shipping_cost, tax_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        product_id,
        quantity_sold,
        revenue,
        platform_fee || 0,
        shipping_cost || 0,
        tax_amount || 0,
      ]
    );

    await client.query(
      `UPDATE inventory
       SET in_stock_quantity = GREATEST(in_stock_quantity - $1, 0),
           updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $2 AND user_id = $3`,
      [quantity_sold, product_id, req.user.id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Sale created successfully",
      sale: sale.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const sales = await pool.query(
      `SELECT
          s.id,
          s.product_id,
          p.product_name,
          p.sku,
          s.quantity_sold,
          s.revenue,
          s.platform_fee,
          s.shipping_cost,
          s.tax_amount,
          s.sale_date
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.sale_date DESC`,
      [req.user.id]
    );

    res.status(200).json({
      count: sales.rows.length,
      sales: sales.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalesSummary = async (req, res, next) => {
  try {
    const summary = await pool.query(
      `SELECT
          COUNT(*) AS total_sales_records,
          COALESCE(SUM(quantity_sold), 0) AS total_units_sold,
          COALESCE(SUM(revenue), 0) AS total_revenue,
          COALESCE(SUM(platform_fee), 0) AS total_platform_fees,
          COALESCE(SUM(shipping_cost), 0) AS total_shipping_cost,
          COALESCE(SUM(tax_amount), 0) AS total_tax
       FROM sales
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