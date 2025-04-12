import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    createdAt:{
         type:Number
    },
     updatedAt:{
           type:Number
     }
},
{ timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });
export default mongoose.model("TransactionItem", Schema);