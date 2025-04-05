import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";

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
        );

        res.status(200).json({
          status: true,
          message: "CART_ITEM_UPDATED",
          data: {
            cartId: cart._id,
            cartItemId: cartItem._id,
            productId: cartItem.productId,
            product_name: product.name,
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
        const cartUpdate = await Cart.findByIdAndUpdate(
          req.params.CartId,
          {
            total_price: cart.total_price + cartItem.subtotal,
          },
          { new: true }
        );
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
            product_name: product.name,
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
}
export default new CartItemController();
