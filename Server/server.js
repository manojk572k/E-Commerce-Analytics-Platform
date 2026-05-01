const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("E-Commerce Analytics Backend is running")
})

const PORT = process.env.port || 5001;

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})