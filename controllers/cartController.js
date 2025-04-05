import Cart from "../models/Cart.js";
import User from "../models/User.js";

class CartController {
  async postCart(req, res) {
    try {
      // Check if userId is provided in request parameters
      if (!req.params.userId) {
        return res.status(400).json({
          status: false,
          message: "USER_ID_REQUIRED",
        });
      }
      // Retrieve user from database using userId
      const user = await User.findById(req.params.userId);
      // Check if user exists
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "USER_NOT_FOUND",
        });
      }
      // Check for an existing active cart for the user
      const cart = await Cart.findOne({
        userId: req.params.userId,
        status: "active",
      });
      // If active cart exists, return it
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
      // Create a new cart for the user
      const newCart = await Cart.create({
        userId: req.params.userId,
        total_price: 0,
        shipping_address: "",
        status: "active",
      });
      // Check if cart creation failed
      if (!newCart) {
        return res.status(500).json({
          status: false,
          message: "CART_CREATE_FAILED",
        });
      }
      // Return successful cart creation response
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
      // Retrieve all carts from the database
      const cart = await Cart.find();
      // Check if any carts were found
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }
      // Return list of carts with count
      return res.status(200).json({
        status: true,
        message: "CART_FOUND",
        count: cart.length,
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
      // Check if cart id is provided in request parameters
      if (!req.params.id) {
        return res.status(400).json({
          status: false,
          message: "CART_ID_REQUIRED",
        });
      }
      // Retrieve cart by id from the database
      const cart = await Cart.findById(req.params.id);
      // Check if cart exists
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }
      // Retrieve user associated with the cart
      const user = await User.findById(cart.userId);
      // Check if user exists for the cart
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "USER_NOT_FOUND",
        });
      }
      // Return cart details along with user info
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
      // Check if userId is provided in request parameters
      if (!req.params.userId) {
        return res.status(400).json({
          status: false,
          message: "USER_ID_REQUIRED",
        });
      }
      // Retrieve user by userId
      const user = await User.findById(req.params.userId);
      // Check if user exists
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "USER_NOT_FOUND",
        });
      }

      // Retrieve carts for the given user
      const cart = await Cart.find({ userId: req.params.userId });
      // Check if any carts were found for the user
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }
      // Return carts details along with user info and count
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

  async putCart(req, res) {
    try {
      // Check if cart id is provided in request parameters
      if (!req.params.id) {
        return res.status(400).json({
          status: false,
          message: "CART_ID_REQUIRED",
        });
      }
      // Retrieve cart by id from the database
      const cart = await Cart.findById(req.params.id);
      // Check if cart exists
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }
      // Validate cart status provided in request body
      if (req.body.status !== "checkout" && req.body.status !== "abandoned") {
        return res.status(400).json({
          status: false,
          message: "CART_STATUS_INVALID",
        });
      }
      // Update cart with new details
      const updatedCart = await Cart.findByIdAndUpdate(
        req.params.id,
        {
          total_price: req.body.total_price,
          shipping_address: req.body.shipping_address,
          status: req.body.status,
        },
        { new: true }
      );
      // Check if cart update failed
      if (!updatedCart) {
        return res.status(500).json({
          status: false,
          message: "CART_UPDATE_FAILED",
        });
      }
      // Return updated cart details
      return res.status(200).json({
        status: true,
        message: "CART_UPDATE_SUCCESS",
        data: {
          id: updatedCart._id,
          total_price: updatedCart.total_price,
          shipping_address: updatedCart.shipping_address,
          status: updatedCart.status,
        },
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  async deleteCart(req, res) {
    try {
      // Check if cart id is provided in request parameters
      if (!req.params.id) {
        return res.status(400).json({
          status: false,
          message: "CART_ID_REQUIRED",
        });
      }
      // Retrieve cart by id from the database
      const cart = await Cart.findById(req.params.id);
      // Check if cart exists
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: "CART_NOT_FOUND",
        });
      }
      // Delete the cart from the database
      await Cart.findByIdAndDelete(req.params.id);
      // Return successful deletion response
      return res.status(200).json({
        status: true,
        message: "CART_DELETE_SUCCESS",
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }
}

export default new CartController();
