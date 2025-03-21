import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    image:{
        type:String,

    }
});

export default mongoose.model("Brand", Schema);