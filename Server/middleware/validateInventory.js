exports.validateInventory = (req, res, next) => {
  const {
    product_id,
    purchased_quantity,
    in_transit_quantity,
    in_stock_quantity,
    low_stock_threshold,
  } = req.body;

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  const numbers = [
    purchased_quantity,
    in_transit_quantity,
    in_stock_quantity,
    low_stock_threshold,
  ];

  for (const value of numbers) {
    if (value !== undefined && Number(value) < 0) {
      return res.status(400).json({
        message: "Inventory values cannot be negative",
      });
    }
  }

  next();
};