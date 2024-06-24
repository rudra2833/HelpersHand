import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/APIResponse.js';

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
    res.redirect("/user");
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

const userbookings = async (res,loggedInUser) => {
    const user = await User.findById(loggedInUser);
    res.render("profile_page/bookings.ejs", { db: user });
}

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

export { registerUser, loginUser, logoutUser, loggedInUser, ensureAuthenticated , userprofile, userbookings, userprofileEdit };
