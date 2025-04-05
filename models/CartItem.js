import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    cartId: {
        type: mongoose.Types.ObjectId,
        ref: "Cart",
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Number,
    },
    updatedAt: {
        type: Number,
    },
},
{ timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });

export default mongoose.model("CartItem", Schema);