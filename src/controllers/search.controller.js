import { ServiceInfo } from "../models/serviceprovider.models.js";
import { User } from "../models/user.model.js";

const search = async (req, res) => {

    console.log(req.body)

    const { category, city, pincode } = req.body;

    if ([ category, pincode , city ].every(field => field && field.trim() === "")) {
        return res.status(400).json({ error: "All fields are required" });
    }


    // const c =  city.toLowerCase().trim();
    // console.log(c);

    try {
        
        const result = await ServiceInfo.find({
            category: category.toLowerCase(), 
            city: city.toLowerCase(), 
            pincodes:{ $in: [pincode] }, 
            availability: true
        }).select('spid avatar providername category charges rating availability city pincodes');

        if(!result){
            return res.status(404).json({ error: "No service provider found" });
        }

        console.log(result);

        // Render a page with the fetched images and data 
        res.render("searchoutput.ejs", { 
            db:result
        });

    } catch (error) {
        console.error("Error in search:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const sppacket = async (req, res) => {

    const serviceProviderId = req.query.id;
    try {
        const spinfo = await ServiceInfo.find({
            spid: serviceProviderId,
        }).select('spid avatar providername email category charges reviewers rating city pincodes');

        if(!spinfo){
            return res.status(404).json({ error: "No service provider found" });
        }

        console.log(spinfo);

        // Render a page with the fetched images and data 
        res.render("sppacket.ejs", { 
            db:spinfo
        });

    } catch (error) {
        console.error("Error in search:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const sppacket_feedback = async (req, res) => {
    const { spid, cust_username, cust_rating, cust_message } = req.body;

    if ([spid, cust_username, cust_rating, cust_message].some(field => !field || field.trim() === "")) {
        return res.status(400).json({ error: "All fields are required" });
    }

    console.log(spid, cust_username, cust_rating, cust_message);

    try {
        const repeatuser = await ServiceInfo.findOne({spid:spid}).where('reviewers.username').equals(cust_username);

        if (repeatuser) {
            return res.status(400).json({ error: "You have already submitted a feedback" });
        }

        const usercheck = await User.findOne({ username: cust_username });

        if (!usercheck) {
            return res.status(404).json({ error: "Create an account first! to submit a feedback" });
        }

        const spinfo = await ServiceInfo.findOne({ spid: spid });

        if (!spinfo) {
            return res.status(404).json({ error: "No service provider found" });
        }

        const feedback = {
            username: cust_username,
            rating: parseFloat(cust_rating),
            message: cust_message
        };

        spinfo.reviewers.push(feedback);

        // Calculate the new average rating
        const totalRatings = spinfo.reviewers.reduce((acc, reviewer) => acc + reviewer.rating, 0);
        const averageRating = (totalRatings / spinfo.reviewers.length).toFixed(1);

        // Update the average rating
        spinfo.rating = averageRating;

        const updated = await spinfo.save();

        if (!updated) {
            return res.status(400).json({ error: "Feedback not added" });
        }

        console.log(updated);

        // Render a page with the fetched images and data
        res.render("sppacket.ejs", { db: [updated] });
    } catch (error) {
        console.error("Error in search:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export { search , sppacket, sppacket_feedback}











































// <% if(locals.db[0].reviewers === 0){ %>
//     <h3>Be first one to put feedback</h3>
// <% } else { %>
//     <% for(var i=0; i< (locals.db[0].reviewers.length); i++){ %>

//         <div class="ad_feedbacks">

//             <div class="feedback_name items">
//                 <h4>Customer name: </h4>
//                 <p class="customer_username"><%= locals.db[0].reviewers[i].username %></p>
//             </div>

//             <div class="feedback_rating items">
//                 <h4>Rating: </h4>
//                 <p class="customer_rating"><%= locals.db[0].reviewers[i].rating %></p>
//             </div>

//             <div class="feedback_review items">
//                 <h4>Review: </h4>
//                 <p class="customer_review"><%= locals.db[0].reviewers[i].message %></p>
//             </div>

//         </div>
//         <% } %>
//     <% } %>
