const pool = require("../db/db");

exports.createReturn = async (req, res, next) => {
  const {
    product_id,
    return_quantity,
    return_reason,
    customer_review,
    sentiment,
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

    const returnedItem = await pool.query(
      `INSERT INTO returns
       (user_id, product_id, return_quantity, return_reason, customer_review, sentiment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        product_id,
        return_quantity,
        return_reason,
        customer_review || null,
        sentiment || null,
      ]
    );

    res.status(201).json({
      message: "Return record created successfully",
      return: returnedItem.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.getReturns = async (req, res, next) => {
  try {
    const returns = await pool.query(
      `SELECT
          r.id,
          r.product_id,
          p.product_name,
          p.sku,
          r.return_quantity,
          r.return_reason,
          r.customer_review,
          r.sentiment,
          r.return_date
       FROM returns r
       JOIN products p ON r.product_id = p.id
       WHERE r.user_id = $1
       ORDER BY r.return_date DESC`,
      [req.user.id]
    );

    res.status(200).json({
      count: returns.rows.length,
      returns: returns.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getReturnsSummary = async (req, res, next) => {
  try {
    const summary = await pool.query(
      `SELECT
          COUNT(*) AS total_return_records,
          COALESCE(SUM(return_quantity), 0) AS total_returned_units
       FROM returns
       WHERE user_id = $1`,
      [req.user.id]
    );

    const topReasons = await pool.query(
      `SELECT
          return_reason,
          COUNT(*) AS reason_count,
          COALESCE(SUM(return_quantity), 0) AS returned_units
       FROM returns
       WHERE user_id = $1
       GROUP BY return_reason
       ORDER BY returned_units DESC`,
      [req.user.id]
    );

    res.status(200).json({
      summary: summary.rows[0],
      top_return_reasons: topReasons.rows,
    });
  } catch (error) {
    next(error);
  }
};