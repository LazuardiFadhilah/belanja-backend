import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profile_pic: {
        type: String,
    },
    role: {
        type: String,
        enum: ["costumer", "admin", "seller"],
        default: "costumer",
        required: true,
    },
    createdAt:{
        type:Number
    },
    updatedAt:{
        type:Number
    }
},
{timestamps:{
    currentTime:()=>Math.floor(Date.now()/1000)
}});

export default mongoose.model("User", Schema);