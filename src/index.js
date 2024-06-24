// require('dotenv').config({path: './env'});
// use to share .env file to all the files during the run
// for using import u have to go in jason->scripts and add "-r dotenv/config<THIS WILL ALSO LOAD .ENV FILE AT RUN> --experimental-json-modules"
// i.e. "nodemon src/index.js" to the above
import dotenv from "dotenv"
dotenv.config({path:"./env"});


import mongoose from "mongoose";
//importing the database name which we want to create from constant.js
import { DB_NAME } from "./constant.js";
//importing the mongodb connection constant variable from db
import connectDB from "./db/db_index.js";
import { app } from "./app.js";


// for GETing the HOME page
app.get("/",(req,res)=>{
    res.render("navbar/home.ejs");
})

app.get("/contactus",(req,res)=>{
    res.render("navbar/contactus.ejs");
})

app.get("/aboutus",(req,res)=>{
    res.render("navbar/aboutus.ejs");
})




// ++++CONTACT-US-AND-NEW-SP-REQUEST+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { sprequest, sendsprequest } from "./controllers/sprequest.controller.js"

// for submiting the form for new service provider
app.post("/sendrequest/submit",sendsprequest);

//send the contact us page
app.get("/joinus",(req,res)=>{
    res.render("forms_page/spform.ejs");
})

//for sending new confirm request
app.post("/joinus/submit",sprequest);








// ++++Sign-In-And-Registration-Of-User+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { registerUser, loginUser, logoutUser, loggedInUser, ensureAuthenticated , userprofile , userbookings} from "./controllers/user.controller.js";
import { userprofileEdit } from "./controllers/user.controller.js";

// when user registers
app.post("/user/register", registerUser);

// when user logins
app.post("/user/login", loginUser);

// when clicks login when comes
app.get("/user", ensureAuthenticated, async (req, res) => {
    if (req.isAuthenticated) {
        userprofile(res,loggedInUser);
    } else {
        res.render("forms_page/log-reg.ejs");
    }
});

//profile edit
app.post("/user/profile/submit",userprofileEdit);


//booking page for user
app.get("/user/bookings", ensureAuthenticated, async (req, res) => {
    if (req.isAuthenticated) {
        userbookings(res,loggedInUser);
    } else {
        res.render("forms_page/log-reg.ejs");
    }
});

// when user logout
// do this action at the user profile
app.post("/user/logout", logoutUser);










// ++++FEEDBACK+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//feedback fuction added
import { submitFeedback } from "./controllers/feedback.controller.js"
app.get("/feedback",(req,res)=>{
    res.render("navbar/feedback.ejs");
})

//after feedback submission
app.post("/feedback/submit",submitFeedback)










// ++++SEARCH+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { search , sppacket , sppacket_feedback} from "./controllers/search.controller.js"
app.post("/search",search);

app.get('/serviceprovider',sppacket);

app.post('/sp/feedback',sppacket_feedback);










// ++++BOOKING-PROCESS+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



//calling the function 
connectDB()
.then(() => {
    //it is just server port listing code
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`)
    })

}).catch((err) => {
    console.log("MongoDB Connection function call error")
});


