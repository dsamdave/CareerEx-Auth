const Auth = require("../models/authModel")
const { validEmail, sendForgotPasswordEmail } = require("../sendMail")
const { findUserService } = require("../service")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");


const handleGetAllUsers = async (req, res)=>{

    console.log(req.user)

    const allUser = await findUserService()

    res.status(200).json({
        messga: "Successful",
        allUser
    })

}

const handleUserRegistration = async (req, res) => {
    try {
      const { email, password, firstName, lastName, state } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: "Please add your email" });
      }
  
      if(!validEmail(email)){
          return  res.status(400).json({message: "Incoprrect email format"})
      }
  
      if (!password) {
        return res.status(400).json({ message: "Please enter password" });
      }
  
      const existingUser = await Auth.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: "User account already exist" });
      }
  
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password should be a min of 6 chars" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      const newUser = new Auth({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        state,
      });
  
      await newUser.save();
  
      // Send user Email
      
  
      res.status(201).json({
        message: "User account created successfully",
        newUser: { email, firstName, lastName, state },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  const handleLogin = async (req, res) => {
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
  }

  const handleForgotPassword = async (req, res) => {
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
  }

  const handleResetPassword = async (req, res )=>{

    const { password } = req.body

    const user = await Auth.findOne({ email: req.user.email })

    if(!user){
        return res.status(404).json({message: "User account not found!"})
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    user.password = hashedPassword

    await user.save()

    res.status(200).json({message: "Password reste successful."})

}



module.exports = {
    handleGetAllUsers,
    handleUserRegistration,
    handleLogin,
    handleForgotPassword,
    handleResetPassword
}