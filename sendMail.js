
const nodemailer = require("nodemailer")

const sendForgotPasswordEmail = async ( email, token )=>{
    
    try {
        const mailTransport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: `${process.env.EMAIL}`,
                pass: `${process.env.EMAIL_PASSWORD}`
            }
        })
    
        const mailDetails = {
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: "Reset Password Notification",
            html: `<h1>Here is the token to reset you password please click on the button,
            
            <a class"" href='https://www.yourcareerex.com/reset-password/${token}'>Reset Password </a>

            if the button does not work for any reason, please click the link below

             <a href='https://www.yourcareerex.com/reset-password/${token}'>Reset Password </a>

            
            
            ${token}
            
            </h1>`
        }
    
        await mailTransport.sendMail(mailDetails)
        
    } catch (error) {
        console.log(error)
    }

}

module.exports = sendForgotPasswordEmail

