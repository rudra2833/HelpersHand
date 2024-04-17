import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/APIResponse.js';

let loggedInUser=null;


const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body
    // console.log("email: ", email);

    if (
        [password, email, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "ALL fields are required")

    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    try {

        //registering the user in the database
        const user = await User.create({
            email,
            password,
            username: username.toLowerCase()
        })

        console.log("User registration is successfully done!!")

        res.redirect("/");

    } catch (error) {
        throw new ApiError(500, "Something went wrong while registering");
    }
})

const loginUser = asyncHandler(async (req, res) => {

    const { email , password } = req.body
    // console.log(email);

    if (!(email && password)) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "Passsword incorrect does not exist");
    }

    loggedInUser = user._id;
    
    // console.log(loggedInUser);

    console.log("User logged-in successful!!")
    res.redirect("/");
})


const logoutUser = asyncHandler(async(req, res) => {
    loggedInUser=null;
    console.log("User logged out successful!!")
    res.redirect("/");
})



export { registerUser, loginUser, logoutUser, loggedInUser }