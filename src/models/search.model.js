import mongoose from "mongoose";

const searchSchema = new mongoose.Schema({
    city:{
        type: String,
        lowercase: true,
        required: true
    },
    pincode:{
        type: [String],
        required: true
    }
});



export const Sp_Search = mongoose.model("Sp-Search", searchSchema);