import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient_name: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    postal_code: {
        type: String,
        required: true,
    },
    note:{
        type: String
    },
    createdAt: {
        type: Number,
    },
    updatedAt: {
        type: Number,
    },
},
{ timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });
export default mongoose.model("ShippingAddress", Schema);