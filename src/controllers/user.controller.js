import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/APIResponse.js';
import { Booking } from '../models/bookings.model.js';
import mongoose from 'mongoose';
import { sendEmail } from './sprequest.controller.js';

let loggedInUser = null;

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if ([password, email, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "ALL fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    try {
        // registering the user in the database
        const user = await User.create({
            email,
            password,
            username: username.toLowerCase()
        });

        console.log("User registration is successfully done!!");

        res.redirect("/user");
    } catch (error) {
        throw new ApiError(500, "Something went wrong while registering");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) {
        throw new ApiError(400, "username or password is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    loggedInUser = user._id;
    
    console.log("User logged-in successfully!!");
    res.redirect("/");
});

const logoutUser = asyncHandler(async (req, res) => {
    loggedInUser = null;
    console.log("User logged out successfully!!");
    res.redirect("/");
});

const ensureAuthenticated = (req, res, next) => {
    if (loggedInUser) {
        req.isAuthenticated = true;
    } else {
        req.isAuthenticated = false;
    }
    next();
};

const userprofile = async (res,loggedInUser) => {
    const user = await User.findById(loggedInUser).select('username email phoneno fullname');
    // console.log(user);

    res.render("profile_page/profile.ejs", { db: user });
};

const userprofileEdit = asyncHandler(async (req, res) => {
    const {fullname ,email, phoneno } = req.body;

    if ([ fullname,email, phoneno].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "ALL fields are required");
    }

    const {password} = req.body;
    const user = await User.findById(loggedInUser);
    
    if(password === "*********"){
        user.fullname = fullname;
        user.email = email;
        user.phoneno = phoneno;
    }else{
        user.fullname = fullname;
        user.email = email;
        user.phoneno = phoneno;
        user.password = password;
    }
    await user.save();
    console.log("User profile updated successfully!!");
    res.redirect("/user");
});

const getUserBookingInfo = async(res,loggedInUser) => {
    try {
        //finding user
        const user = await User.findById(loggedInUser);
    
        // Aggregate bookings related to the user
        const bookings = await Booking.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(loggedInUser) }
            },
            {
                $lookup: {
                    from: 'serviceinfos',  // Ensure this matches your actual collection name
                    localField: 'provider_id',
                    foreignField: '_id',
                    as: 'provider'
                }
            },
            {
                $unwind: "$provider"
            },
            {
                $project: {
                    _id: 0,
                    date: 1, // Include the date field for formatting,
                    time: "$time",
                    totalprize: "$totalprize", 
                    providerName: "$provider.providername",
                    category: "$provider.category",
                    address: "$address",
                    status: "$status",
                }
            }
        ]);

        const formattedResult = bookings.map(item => {
            const date = new Date(item.date);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const year = date.getFullYear();

            return {
                ...item,
                day: day,
                month: month,
                year: year
            };
        });

        console.log("Bookings:", formattedResult);

        
        // if (!bookings.length) {
        //     throw new Error("Booking info is not available");
        // }
        res.render("profile_page/bookings.ejs", { db: formattedResult });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const forgetpassword = async(req,res)=>{
    const { email } = req.body;
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    var random8digit = Math.floor(100000000 * Math.random());

    sendEmail(email, "Password Reset", `Your new password is ${random8digit}`);

    user.password = random8digit;

    await user.save();
    console.log("User password updated successfully!!");

    res.redirect("/");

}

export { registerUser, loginUser, logoutUser, loggedInUser, ensureAuthenticated , userprofile, userprofileEdit};
export { getUserBookingInfo , forgetpassword};

