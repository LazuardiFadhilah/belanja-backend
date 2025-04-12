import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
import User from "../models/User.js";

class CartItemController {
  async createCartItem(req, res) {
    try {
      if (!req.params.CartId) {
        return res.status(400).json({
          status: false,
          message: "CART_ID_REQUIRED",
        });
      }
      const cart = await Cart.findById(req.params.CartId);
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }
      if (cart.status !== "active") {
        return res.status(400).json({
          status: false,
          message: "CART_NOT_ACTIVE",
        });
      }
      if (!req.body.productId) {
        return res.status(400).json({
          status: false,
          message: "PRODUCT_ID_REQUIRED",
        });
      }
      const product = await Product.findById(req.body.productId);
      if (!product) {
        return res.status(404).json({
          status: false,
          message: "PRODUCT_NOT_FOUND",
        });
      }
      const duplicateItem = await CartItem.findOne({
        cartId: req.params.CartId,
        productId: req.body.productId,
      });
      if (duplicateItem) {
        const cartItem = await CartItem.findByIdAndUpdate(
          duplicateItem._id,
          {
            quantity:
              duplicateItem.quantity + req.body.quantity ||
              duplicateItem.quantity + 1,
            subtotal:
              (duplicateItem.quantity + req.body.quantity) * product.price ||
              (duplicateItem.quantity + 1) * product.price,
          },
          { new: true }
        ).populate({
          path: "productId",
          select:
            "name description categoryId brandId price location stocks images",
          populate: {
            path: "categoryId brandId",
            select: "title image",
          },
        });

        res.status(200).json({
          status: true,
          message: "CART_ITEM_UPDATED",
          data: {
            cartId: cart._id,
            cartItemId: cartItem._id,
            productId: cartItem.productId,

            quantity: cartItem.quantity,
            price: cartItem.price,
            subtotal: cartItem.subtotal,
          },
        });
      } else {
        const cartItem = await CartItem.create({
          cartId: req.params.CartId,
          productId: req.body.productId,
          quantity: req.body.quantity || 1,
          price: product.price,
          subtotal: req.body.quantity * product.price || product.price,
        });
        res.status(201).json({
          status: true,
          message: "CART_ITEM_CREATED",
          data: {
            cartId: cart._id,
            cartItemId: cartItem._id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: cartItem.price,
            subtotal: cartItem.subtotal,
          },
        });
      }
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  async getAllCartItems(req, res) {
    try {
      const cartItems = await CartItem.find().populate({
        path: "productId",
        select: "name price",
        });
      if (!cartItems) {
        return res.status(404).json({
          status: false,
          message: "CART_ITEM_NOT_FOUND",
        });
      }
      return res.status(200).json({
        status: true,
        message: "CART_ITEM_FOUND",
        data: cartItems.map((item) => ({
          itemId: item._id,
          cartId: item.cartId,
          product:{
            productId: item.productId._id,
            product_name: item.productId.name,
            product_price: item.productId.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          }
        })),
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
      
    }
  }

  async putCartItem(req, res) {
   try {
    if(!req.params.cartItemId){
      return res.status(400).json({
        status: false,
        message: "CART_ITEM_ID_REQUIRED",
      });
    }
    const cartItem = await CartItem.findById(req.params.cartItemId);
    if(!cartItem){
      return res.status(404).json({
        status: false,
        message: "CART_ITEM_NOT_FOUND",
      });}
      const updateCartItem = await CartItem.findByIdAndUpdate(
        req.params.cartItemId,
        {
          $set: {
            quantity: req.body.quantity,
            subtotal: req.body.quantity * cartItem.price,
          },
        },
        { new: true }
      ).populate({
        path: "productId",
        select: "name price",
        });
      if(!updateCartItem){
        return res.status(404).json({
          status: false,
          message: "CART_ITEM_NOT_FOUND",
        });
      }
      return res.status(200).json({
        status: true,
        message: "CART_ITEM_UPDATED",
        data: {
          cartId: cartItem.cartId,
          cartItemId: updateCartItem._id,
          productId: updateCartItem.productId,
          quantity: updateCartItem.quantity,
          price: updateCartItem.price,
          subtotal: updateCartItem.subtotal,
        },
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
      
    }
  }

  async deleteCartItem(req, res) {
    try {
      if(!req.params.cartItemId){
        return res.status(400).json({
          status: false,
          message: "CART_ITEM_ID_REQUIRED",
        });
      }
      const cartItem = await CartItem.findById(req.params.cartItemId);
      if(!cartItem){
        return res.status(404).json({
          status: false,
          message: "CART_ITEM_NOT_FOUND",
        });
      }
      const deleteCartItem = await CartItem.findByIdAndDelete(req.params.cartItemId);
      if(!deleteCartItem){
        return res.status(404).json({
          status: false,
          message: "CART_ITEM_NOT_FOUND",
        });
      }
      return res.status(200).json({
        status: true,
        message: "CART_ITEM_DELETED",
        data: {
          cartId: cartItem.cartId,
          cartItemId: deleteCartItem._id,
          productId: deleteCartItem.productId,
          quantity: deleteCartItem.quantity,
          price: deleteCartItem.price,
          subtotal: deleteCartItem.subtotal,
        },
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
      
    }
  }
}
export default new CartItemController();
