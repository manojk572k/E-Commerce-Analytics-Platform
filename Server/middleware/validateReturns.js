exports.validateReturn = (req, res, next) => {
  const {
    product_id,
    return_quantity,
    return_reason,
  } = req.body;

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  if (!return_quantity || Number(return_quantity) <= 0) {
    return res.status(400).json({
      message: "Return quantity must be greater than 0",
    });
  }

  if (!return_reason) {
    return res.status(400).json({
      message: "Return reason is required",
    });
  }

  next();
};