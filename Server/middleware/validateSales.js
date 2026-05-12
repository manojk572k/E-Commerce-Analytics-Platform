exports.validateSale = (req, res, next) => {
  const {
    product_id,
    quantity_sold,
    revenue,
    platform_fee,
    shipping_cost,
    tax_amount,
  } = req.body;

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  if (!quantity_sold || Number(quantity_sold) <= 0) {
    return res.status(400).json({
      message: "Quantity sold must be greater than 0",
    });
  }

  if (!revenue || Number(revenue) <= 0) {
    return res.status(400).json({
      message: "Revenue must be greater than 0",
    });
  }

  const costs = [platform_fee, shipping_cost, tax_amount];

  for (const value of costs) {
    if (value !== undefined && Number(value) < 0) {
      return res.status(400).json({
        message: "Fees, shipping cost, and tax cannot be negative",
      });
    }
  }

  next();
};