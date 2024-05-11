import { ServiceInfo } from "../models/serviceprovider.models.js";

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
        }).select('avatar providername category charges rating availability city pincodes');;

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

export { search }