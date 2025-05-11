const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Auth = require("./authModel")
dotenv.config()



const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8000

mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log("Mongodb connected...")

    app.listen(PORT, ()=>{
        console.log(`Server started running on Port ${PORT}`)
    }) 
})


app.post("/sign-up", async (req, res)=>{

    try {
        
        const { email, password, firstName, lastName, state } = req.body

        if(!email){
            return res.status(400).json({message: "Please add your email"})
        }
    
        if(!password){
            return res.status(400).json({message: "Please enter password"})
        }
    
        const existingUser = await Auth.findOne({ email })
    
        if(existingUser){
            return res.status(400).json({message: "User account already exist"})
        }
    
        if(password.length < 6){
            return res.status(400).json({message: "Password should be a min of 6 chars"}) 
        }

        const hashedPassword = await bcrypt.hash(password, 12)
    
        const newUser = new Auth({ 
            email, 
            password: hashedPassword, 
            firstName, 
            lastName, 
            state 
        })
    
        await newUser.save()

        // Send user Email
    
        res.status(201).json({
            message: "User account created successfully",
            newUser: { email, firstName, lastName, state }
        })


    } catch (error) {
        res.status(500).json({message: error.message})
    }

})

app.post("/login", async (req, res)=>{

    const { email, password } = req.body

    const user = await Auth.findOne({ email })
    // .select("-password")

    if(!user){
        return res.status(404).json({message: "User account does not exist."})
    }

    const isMatch = await bcrypt.compare(password, user?.password)

    if(!isMatch){
        return res.status(400).json({message: "Incorrect email or password."})
    }

    // if(!user.verified){

    // }


    // Generate a token
    const accessToken = jwt.sign(
        {id: user?._id },
        process.env.ACCESS_TOKEN,
        {expiresIn: "5m"}
    )

    const refreshToken = jwt.sign(
        {id: user?._id},
        process.env.REFRESH_TOKEN,
        {expiresIn: "30d"}
    )


    res.status(200).json({
        message: "Login successful",
        accessToken,
        user: {
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            state: user?.state
        },
        refreshToken
    })

})
