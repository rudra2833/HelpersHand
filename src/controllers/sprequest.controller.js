import { Sprequest } from '../models/sprequest.model.js';   
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file



const sprequest = async (req, res) => {

    const { fullname, email, phoneno } = req.body;

    if ([fullname, email, phoneno].every(field => field && field.trim() === "")) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {

        // Check if the user with the same email already exists
        const existingRequest = await Sprequest.findOne({ email });

        if (existingRequest) {
            return res.status(409).json({ error: "Request with this email already done" });
        }

        // Create new feedback
        const newrequest = await Sprequest.create({
            fullname,
            email,
            phoneno
        });

        res.redirect("/contactus");

    } catch (error) {
        console.error("Error submitting the Request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const sendsprequest = async (req,res) => {

    var {email} = req.body;

    if(!email){
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        
        const transporter = nodemailer.createTransport({

            service: 'gmail',
            host:"smtp.gmail.com",
            auth: {
                user: process.env.EMAIL_USER,  // Replace with your environment variable
                pass: process.env.EMAIL_PASS  // Replace with your environment variable
            }
        });
    
        let info = await transporter.sendMail({
    
            from: `"HelpersHand" <${process.env.EMAIL_USER}>`, // Sender address
            to: email, // List of receivers
            subject: "Join Request as a Service Provider in HelpersHand", // Subject line
            // text: "Welcome Aboard, Hope you except all the terms and conditions", // Plain text body
            html: "<b>Hello world</b><p>Welcome Aboard, Hope you except all the terms and conditions</p><br><a href='http://localhost:3002/joinus'>Click here to join</a>",
    
        });
    
        console.log("Message sent: %s", info.messageId);
    
        res.redirect("/");

    } catch (error) {
        console.error("Error submitting the New Request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export { sprequest ,sendsprequest };