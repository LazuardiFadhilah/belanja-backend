import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    categoryId:{
        type: mongoose.Types.ObjectId,
        ref:"Category",
        required:true
    },
    brandId:{
        type: mongoose.Types.ObjectId,
        ref:"Brand",
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    stocks:{
        type:Number,
        required:true
    },
    images:[{
        type:String
    }],
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

export default mongoose.model("Product", Schema);