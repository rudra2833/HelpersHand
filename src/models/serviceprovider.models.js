import mongoose, { Schema } from "mongoose";


const review = new Schema({
    username: {
        type: string,
        required: true,
        lowercase: true,
        trim: true,
    },
    rating: {
        type: Number, // Assuming rating will be a number
        required: true,
        min: 1, // Minimum rating value
        max: 5, // Maximum rating value
    },
    review: {
        type: String,
        required: true,
    }
})

const Book = new Schema({

    timeslot: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    }
});

const pastbooks = new Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
},
{timestamps: true,}
);

const serviceInfo = new Schema({
    Providername: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    Phoneno: {
        type: String,
        required: true,
        trim: true,

    },
    Adharno: {
        type: String,
        required: true,
        trim: true,

    },
    birthday: {
        type: Date,
        required: true,
    },
    Password: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
    },
    Catagory: {
        type: String,
        required: true,
    },
    Charges: {
        type: Number,
        required: true,
        trim: true,
    },
    Rating: {
        type: Number, // Assuming rating will be a number
        required: true,
        min: 1, // Minimum rating value
        max: 5, // Maximum rating value
    },
    Availability: {
        type: Boolean,
        required: true,
    },
    city: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    reviewers: {
        type: [review],
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    slot: {
        type: [Book],
        required: true,
    },
    PastBooking: {
        type: [pastbooks],
        required: true,
    }
},
{timestamps: true,}
)

export const ServiceInfo = mongoose.model('ServiceInfo', serviceInfo);