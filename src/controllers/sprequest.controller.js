import { Sprequest } from '../models/sprequest.model.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

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

const sendsprequest = async (req, res) => {

    var { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {

        const userEmail = email;
        const userSubject = "Welcome to Helpers Hand: Next Steps to Join Our Platform";
        const userHtml = `<p style="color: black;">Dear Sir/Maam,</p>
    <p>
    Thank you for your interest in joining Helper's Hand! We are excited about the possibility of working together to provide 
    top-quality services to our customers.<br>
    Requirements for Joining Helper's Hand:
    <br>
    Age Requirement: <strong> You must be 18 years or older.</strong>
    <br>
    Service Knowledge: <strong>You should have sufficient knowledge and experience in the services you wish to offer through our platform.</strong>
    <br>
    Training and Registration: To ensure all our service providers meet our standards of excellence, we require a one-month training period with our experts. This training
     will help you familiarize yourself with our procedures and quality expectations. The training fee is 2000 rupees.
    <br>
    <br>
    Next Steps:
    <br>
    Verification: Please reply to this email with proof of age (e.g., a copy of your ID).
    <br>
    Experience: Provide a brief description of your experience and expertise in the services you want to offer.
    <br>
    Training Enrollment: Confirm your willingness to undergo the one-month training. Once confirmed, we will provide you with the training schedule and payment details for the 2000 rupees fee.
    <br>
    <br>
    Training Details:
    <br>
        Duration: 1 month
    <br>
    Fee: 2000 rupees
    <br>
    Content: The training will cover our service standards, customer interaction protocols, and best practices to ensure high-quality service delivery.
    <br>
    Upon successful completion of the training, your profile will be added to our website, allowing you to start accepting service requests from customers.
    <br>
    <br>
    We are committed to building a team of skilled and reliable service providers. Your cooperation in meeting these requirements is essential to maintaining the quality our customers expect.
    <br>
    <br>
    If you have any questions or need further information, please feel free to contact us at helpershand506219@gmail.com.
    <br>
    <br>
    If you are agreeing the above conditions and ready to join Helper's Hand, please click the link below to confirm your enrollment.
    <a href="http://localhost:3002/joinus"><h1>Click Here</h1></a>
    </p>
    <p style="color: black;">
    We look forward to welcoming you to the Helper's Hand team!
    <br><br>
    Best regards,
    <br>
    Helper's Hand
    </p>`;
        await sendEmail(userEmail, userSubject, userHtml);
        res.redirect("/");

    } catch (error) {
        console.error("Error submitting the New Request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export { sprequest, sendsprequest ,sendEmail};