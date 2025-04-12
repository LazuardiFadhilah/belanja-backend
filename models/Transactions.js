import mongoose from "mongoose";

const Schema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   shippingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipping",
   },
   totalPrice:{
        type: Number,
        required: true,
   },
   status:{
        type: String,
        enum: ["pending", "paid", "shipped", "completed", "canceled"],
        default: "pending",
   },
   paymentId:{
        type: String
   },
   paymentURL:{
        type: String
   },
   createdAt:{
        type:Number
   },
    updatedAt:{
          type:Number
    }
},
{ timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });

export default mongoose.model("Transaction", Schema);