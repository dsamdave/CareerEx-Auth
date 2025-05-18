const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("./models/authModel");
const { sendForgotPasswordEmail, validEmail } = require("./sendMail");
const { handleGetAllUsers, handleUserRegistration } = require("./Controllers");
const { validateRegister, authorization } = require("./middleware");
dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("Mongodb connected...");

  app.listen(PORT, () => {
    console.log(`Server started running on Port ${PORT}`);
  });
});

app.post("/sign-up", validateRegister, handleUserRegistration);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Auth.findOne({ email });
  // .select("-password")

  if (!user) {
    return res.status(404).json({ message: "User account does not exist." });
  }

  const isMatch = await bcrypt.compare(password, user?.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect email or password." });
  }

  // if(!user.verified){

  // }

  // Generate a token
  const accessToken = jwt.sign({ id: user?._id }, process.env.ACCESS_TOKEN, {
    expiresIn: "5h",
  });

  const refreshToken = jwt.sign({ id: user?._id }, process.env.REFRESH_TOKEN, {
    expiresIn: "30d",
  });

  res.status(200).json({
    message: "Login successful",
    accessToken,
    user: {
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      state: user?.state,
      role: user?.role
    },
    refreshToken,
  });
});

app.post("/forgot-password", async (req, res) => {
  const { email, userName } = req.body;

  // let user

  // if(email){
  //     const user = await Auth.findOne({ email })
  // }
  // if(userName){
  //     const user = await Auth.findOne({ userName })
  // }

  const user = await Auth.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  //   Send the user an email with their token

  const accessToken = await jwt.sign(
    {user},
    `${process.env.ACCESS_TOKEN}`,
    { expiresIn: "5m"}

  )

  await sendForgotPasswordEmail(email, accessToken)

  // Send OTP

  res.status(200).json({ message: "Please check your email inbox" });
});

app.patch("/reset-password", authorization, async (req, res )=>{

    const { password } = req.body

    const user = await Auth.findOne({ email: req.user.email })

    if(!user){
        return res.status(404).json({message: "User account not found!"})
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    user.password = hashedPassword

    await user.save()

    res.status(200).json({message: "Password reste successful."})

})

// MVC -R
// Model Controller Routes Middle-ware

// Middlewares / Authorization /Validations

// Deploy 

app.get("/all-users", authorization, handleGetAllUsers)
