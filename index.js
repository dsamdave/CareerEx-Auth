const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("./models/authModel");
const cors = require("cors")
const routes = require("./Routes")
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("Mongodb connected...");

  app.listen(PORT, () => {
    console.log(`Server started running on Port ${PORT}`);
  });
});

app.get("/", (req, res)=>{
  res.status(200).json({message: "Welcome to career ex cohort backend"})
})

app.use("/api", routes)

