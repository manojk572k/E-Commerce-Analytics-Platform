const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");

require("dotenv").config();

require("./db/db");

const app = express();

app.use(helmet())
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const limiter = rateLimit({
  windowMs: 15* 60 * 1000,
  max: 100,
})

app.use(limiter)

app.get("/",(req,res)=>{
  res.send("E-Commerce Analytics Backend is running")
})

const PORT = process.env.port || 5001;

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})