exports.validateProduct = (req, res, next) => {
  const {
    product_name,
    sku,
    cost_price,
    selling_price,
  } = req.body;

  if (!product_name || !sku) {
    return res.status(400).json({
      message: "Product name and SKU are required",
    });
  }

  if (cost_price !== undefined && Number(cost_price) < 0) {
    return res.status(400).json({
      message: "Cost price cannot be negative",
    });
  }

  if (selling_price !== undefined && Number(selling_price) < 0) {
    return res.status(400).json({
      message: "Selling price cannot be negative",
    });
  }

  next();
};