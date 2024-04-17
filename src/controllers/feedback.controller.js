import {Feedback} from '../models/feedback.model.js'

import { app } from "../app.js";


const submitFeedback = async (req, res) => {
    console.log("Server received feedback");

    // console.log(req.body); // This should log the form data

    // Destructure fields from req.body
    const { name, email, message, rating } = req.body;

    // console.log(name, email, message, rating);

    // Validate input fields
    if ([ name, email, message,rating ].every(field => field && field.trim() === "")) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if the user with the same email already exists
        const existingFeedback = await Feedback.findOne({ email });

        if (existingFeedback) {
            return res.status(409).json({ error: "Feedback with this email already exists" });
        }

        // Create new feedback
        const newFeedback = await Feedback.create({
            name,
            email,
            message,
            rating
        });

        // res.redirect("/feedback");
        res.render("navbar/feedback.ejs");
        
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export  { submitFeedback };

