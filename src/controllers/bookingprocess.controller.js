import { ServiceInfo } from "../models/serviceprovider.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.model.js";
import { Booking } from "../models/bookings.model.js";
import dotenv from "dotenv";
import nodemailer from 'nodemailer';

dotenv.config();  // Load environment variables from .env file

// Helper function to send emails
const sendEmail = async (to, subject, text, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transporter.sendMail({
        from: `"Helper Hand" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    });

    console.log("Message sent: %s", info.messageId);
    return info;
};


const bookingRequest = async (res,loggedInUser,spid) => {
    console.log(spid)
    const result = await ServiceInfo.find({spid});
    console.log(result);

    res.render("booking_page.ejs", { db: result });
};

const bookingconfirm = async (res, req,loggedInUser) => {
    
    const { time, date, address, charges ,spid } = req.body;
    console.log("Server received booking request");

    try {
        // Check if the user exists
        const user = await User.findById(loggedInUser);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const serviceProvider = await ServiceInfo.find({spid});
        const provider_id = serviceProvider[0]._id;

        // Create new booking
        const newBooking = await Booking.create({
            time,
            date,
            address,
            totalprize:charges,
            provider_id,
            user_id:loggedInUser,
            status: 'pending'
        });

        // // Send email to user
        // const userEmail = user.email;
        // const userSubject = "Booking Confirmation";
        // const userText = `Dear ${user.username}, your booking for ${date} at ${time} has been successfully created.`;
        // const userHtml = `<p>Dear ${user.username},</p><p>Your booking for ${date} at ${time} has been successfully created.</p>`;
        // await sendEmail(userEmail, userSubject, userText, userHtml);

        // // Send email to service provider
        // const providerEmail = serviceProvider.email; // Assuming there's an 'email' field in ServiceInfo model
        // const providerSubject = "New Booking Notification";
        // const providerText = `Dear ${serviceProvider.providername}, you have a new booking for ${date} at ${time}.`;
        // const providerHtml = `<p>Dear ${serviceProvider.providername},</p><p>You have a new booking for ${date} at ${time}.</p>`;
        // await sendEmail(providerEmail, providerSubject, providerText, providerHtml);

        res.redirect("/");
    } catch (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({ error: "Internal server error" });
    }




};

const createBooking = async (req, res) => {

    
};



export {bookingRequest , bookingconfirm }