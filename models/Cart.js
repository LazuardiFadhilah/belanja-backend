import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    userId:[{
        type: mongoose.Types.ObjectId,
        ref:"User",
    }],
   total_price:{
        type:Number,
        required:true
    },
    shipping_address:{
        type:String,
    },
    status:{
        type:String,
        enum:["active","checkout","abandoned"],
        default:"active",
        required:true
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

export default mongoose.model("Cart", Schema);