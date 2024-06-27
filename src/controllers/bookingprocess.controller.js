import { ServiceInfo } from "../models/serviceprovider.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.model.js";
import { Booking } from "../models/bookings.model.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // Load environment variables from .env file

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: `"Helper Hand" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
};

const bookingRequest = async (res, loggedInUser, spid) => {
    console.log(spid);
    const result = await ServiceInfo.find({ spid });
    console.log(result);

    res.render("booking_page.ejs", { db: result });
};

const bookingconfirm = async (res, req, loggedInUser) => {
    const { time, date, address, charges, spid } = req.body;
    console.log("Server received booking request");

    try {
        // Check if the user exists
        const user = await User.findById(loggedInUser);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const serviceProvider = await ServiceInfo.find({ spid });
        const provider_id = serviceProvider[0]._id;

        // Create new booking
        const newBooking = await Booking.create({
            time,
            date,
            address,
            totalprize: charges,
            provider_id,
            user_id: loggedInUser,
            status: "pending",
        });

        if(!newBooking){
            return res.status(404).json({ error: "Unable to book a request error in creating new booking" });
        }

        // Send email to user
        const userEmail = "monkeydluffy1483@gmail.com";
        const userSubject = "Booking Confirmation - Helpers Hand Service";
        const userHtml = `<p style="color: black;">Dear <strong>${user.username}</strong>,<br>
        Thank you for choosing Helper's Hand for your <strong>${serviceProvider[0].category}</strong> needs!<br>
        Our team is dedicated to providing top-quality service, and we look forward to assisting you.<br>
        You have successfully booked an appointment.<br>
        Booking Details:
        <br>
        Service: <strong>${serviceProvider[0].category}</strong>
        <br>
        Service Provider Name: <strong>${serviceProvider[0].providername}</strong>
        <br>
        Date: <strong>${date}</strong>
        <br>
        Time: <strong>${time}</strong>
        <br>
        Address: <strong>${address}</strong>
        </p>
        <p style="color: black;">
        Thank you once again for choosing Helper's Hand. We look forward to serving you!
        <br><br>
        Best regards,
        <br>
        Helper's Hand
        </p>
        <p>Your booking for ${date} at  has been successfully created.</p>`;
        await sendEmail(userEmail, userSubject, userHtml);

        // Send email to service provider
        const providerEmail = "rudrapatel2833@gmail.com";
        const providerSubject = "New Booking Notification";
        const providerHtml = `<p>Dear ${serviceProvider[0].providername},</p>
        <p>
        We are pleased to inform you that a new service booking has been assigned to you via the Helper's Hand platform.
        <br>
        Booking Details:
        <br>
        Service Date: <strong>${date}</strong>
        <br>
        Service Time: <strong>${time}</strong>
        <br>
        Service Address: <strong>${address}</strong>
        <br>
        <br>
        Thank you for your commitment to providing excellent service and for being a valued partner of Helper's Hand.
        <br>
        Best regards,
        </p>
        <p>Should you have any questions or require additional information regarding this booking, 
        please do not hesitate to contact our support team at helpershand506219@gmail.com.</p>`;
        await sendEmail(providerEmail, providerSubject, providerHtml);

        res.redirect("/");
    } catch (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { bookingRequest, bookingconfirm };
