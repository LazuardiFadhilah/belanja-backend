import Cart from "../models/Cart.js";
import User from "../models/User.js";

class CartController {
  async postCart(req, res) {
    try {
      if (!req.params.userId) {
        return res.status(400).json({
          status: false,
          message: "USER_ID_REQUIRED",
        });
      }
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "USER_NOT_FOUND",
        });
      }
      const cart = await Cart.findOne({
        userId: req.params.userId,
        status: "active",
      });
      if (cart) {
        return res.status(200).json({
          status: true,
          message: "ACTIVE_CART_ALREADY_EXISTS",
          data: {
            user: user.fullname,
            cart: {
              id: cart._id,
              total_price: cart.total_price,
              shipping_address: cart.shipping_address,
              status: cart.status,
            },
          },
        });
      }
      const newCart = await Cart.create({
        userId: req.params.userId,
        total_price: 0,
        shipping_address: "",
        status: "active",
      });
      if (!newCart) {
        return res.status(500).json({
          status: false,
          message: "CART_CREATE_FAILED",
        });
      }
      return res.status(200).json({
        status: true,
        message: "CART_CREATE_SUCCESS",
        data: {
          user: user.fullname,
          cart: {
            id: newCart._id,
            total_price: newCart.total_price,
            shipping_address: newCart.shipping_address,
            status: newCart.status,
          },
        },
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  async getCart(req, res) {
    try {
      const cart = await Cart.find();
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }
      return res.status(200).json({
        status: true,
        message: "CART_FOUND",
        data: cart.map((item) => ({
          userId: item.userId,
          cart: {
            id: item._id,
            total_price: item.total_price,
            shipping_address: item.shipping_address,
            status: item.status,
          },
        })),
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  async getCartById(req, res) {
    try {
        if(!req.params.id) {
            return res.status(400).json({
                status: false,
                message: "CART_ID_REQUIRED",
            });
        }
        const cart = await Cart.findById(req.params.id);
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
        return res.status(200).json({
            status: true,
            message: "CART_FOUND",
            data: {
                user: user.fullname,
                cart: {
                    id: cart._id,
                    total_price: cart.total_price,
                    shipping_address: cart.shipping_address,
                    status: cart.status,
                },
            },
        });
    } catch (error) {
        return res
          .status(error.code || 500)
          .json({ status: false, message: error.message });
      }
  }

  async getCartByUserId(req, res) {
    try {
        if(!req.params.userId) {
            return res.status(400).json({
                status: false,
                message: "USER_ID_REQUIRED",
            });
        }
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "USER_NOT_FOUND",
            });
        }

        const cart = await Cart.find({userId: req.params.userId});
        if (!cart) {
            return res.status(404).json({
                status: false,
                message: "CART_NOT_FOUND",
            });
        }
        return res.status(200).json({
            status: true,
            message: "CART_FOUND",
            data: {
                user: user.fullname,
                count: cart.length,
                cart: cart.map((item) => ({
                    id: item._id,
                    total_price: item.total_price,
                    shipping_address: item.shipping_address,
                    status: item.status,
                })),
            },
        });
    } catch (error) {
        return res
          .status(error.code || 500)
          .json({ status: false, message: error.message });
      }
  }
}

export default new CartController();
