const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// REGISTER USER
exports.registerUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, hashedPassword]
    );

    const user = newUser.rows[0];

    // Generate token after registration
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN USER
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// GET LOGGED-IN USER PROFILE
exports.getProfile = async (req, res, next) => {
  try {
    const userResult = await pool.query(
      `SELECT id, email, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: userResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};