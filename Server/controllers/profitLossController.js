const pool = require("../db/db");

exports.getProfitLoss = async (req, res, next) => {
  try {
    const profitLoss = await pool.query(
      `SELECT
          s.id AS sale_id,
          p.product_name,
          p.sku,
          s.quantity_sold,
          p.cost_price,
          p.selling_price,
          s.revenue,
          s.platform_fee,
          s.shipping_cost,
          s.tax_amount,
          (p.cost_price * s.quantity_sold) AS total_product_cost,
          (
            s.revenue 
            - s.platform_fee 
            - s.shipping_cost 
            - s.tax_amount 
            - (p.cost_price * s.quantity_sold)
          ) AS net_profit,
          CASE
            WHEN s.revenue > 0 THEN ROUND(
              (
                (
                  s.revenue 
                  - s.platform_fee 
                  - s.shipping_cost 
                  - s.tax_amount 
                  - (p.cost_price * s.quantity_sold)
                ) / s.revenue
              ) * 100, 2
            )
            ELSE 0
          END AS profit_margin_percentage,
          s.sale_date
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.sale_date DESC`,
      [req.user.id]
    );

    res.status(200).json({
      count: profitLoss.rows.length,
      profit_loss: profitLoss.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfitLossSummary = async (req, res, next) => {
  try {
    const summary = await pool.query(
      `SELECT
          COALESCE(SUM(s.revenue), 0) AS total_revenue,
          COALESCE(SUM(s.platform_fee), 0) AS total_platform_fees,
          COALESCE(SUM(s.shipping_cost), 0) AS total_shipping_cost,
          COALESCE(SUM(s.tax_amount), 0) AS total_tax,
          COALESCE(SUM(p.cost_price * s.quantity_sold), 0) AS total_product_cost,
          COALESCE(
            SUM(
              s.revenue 
              - s.platform_fee 
              - s.shipping_cost 
              - s.tax_amount 
              - (p.cost_price * s.quantity_sold)
            ), 0
          ) AS total_net_profit
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE s.user_id = $1`,
      [req.user.id]
    );

    const result = summary.rows[0];

    const totalRevenue = Number(result.total_revenue);
    const totalNetProfit = Number(result.total_net_profit);

    const profitMargin =
      totalRevenue > 0
        ? ((totalNetProfit / totalRevenue) * 100).toFixed(2)
        : "0.00";

    res.status(200).json({
      summary: {
        ...result,
        profit_margin_percentage: profitMargin,
      },
    });
  } catch (error) {
    next(error);
  }
};