import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
import User from "../models/User.js";
import emailExist from "../libraries/emailExist.js";

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

        if (!cartUpdate) {
          return res.status(404).json({
            status: false,
            message: "CART_NOT_FOUND",
          });
        }
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

  async getCartItemByCartId(req, res) {
    try {
      if (!req.params.cartId) {
        return res.status(400).json({
          status: false,
          message: "CART_ID_REQUIRED",
        });
      }

      const cart = await Cart.findById(req.params.cartId);
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }

      const user = await User.findById(cart.userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "USER_NOT_FOUND",
        });
      }

      const cartItem = await CartItem.find({
        cartId: req.params.cartId,
      }).populate({
        path: "productId",
        select:"name price stocks",
      });
      if (!cartItem) {
        return res.status(404).json({
          status: false,
          message: "CART_ITEM_NOT_FOUND",
        });
      }

      const updatedTotalPrice = cartItem.reduce((acc, item) => acc + item.subtotal, 0);
      cart.total_price = updatedTotalPrice;
      await cart.save();
      
        return res.status(200).json({
          status: true,
          message: "CART_ITEM_FOUND",
          data: {
            cartId: cart._id,
            total_price: cart.total_price,
            shipping_address: cart.shipping_address,
            status: cart.status,
            user:{
              fullname: user.fullname,
              email: user.email,
            },
            cart_item_count: cartItem.length,
            cart_Items: cartItem.map((item) => ({
              product_name: item.productId.name,
              product_price: item.productId.price,
              product_stocks: item.productId.stocks,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        });

     
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
}
export default new CartItemController();
