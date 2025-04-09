import Cart from "../models/Cart.js";
import User from "../models/User.js";
import CartItem from "../models/CartItem.js";
import Products from "../models/Products.js";

class CartController {
  // 📦 Membuat keranjang baru untuk user tertentu
  async postCart(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ status: false, message: "USER_ID_REQUIRED" });
      }

      // 🔍 Cek apakah user tersedia
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: false, message: "USER_NOT_FOUND" });
      }

      // 🔁 Cek apakah user sudah punya keranjang aktif
      const existingCart = await Cart.findOne({ userId, status: "active" });
      if (existingCart) {
        return res.status(200).json({
          status: true,
          message: "ACTIVE_CART_ALREADY_EXISTS",
          data: {
            user: user.fullname,
            cart: {
              id: existingCart._id,
              total_price: existingCart.total_price,
              shipping_address: existingCart.shipping_address,
              status: existingCart.status,
            },
          },
        });
      }

      // ✅ Jika belum ada, buat keranjang baru
      const newCart = await Cart.create({
        userId,
        total_price: 0,
        shipping_address: "",
        status: "active",
      });

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
      return res.status(error.code || 500).json({ status: false, message: error.message });
    }
  }

  // 📥 Menampilkan semua keranjang yang ada di database
async getCart(req, res) {
  try {
    const carts = await Cart.find();
    if (!carts || carts.length === 0) {
      return res.status(404).json({ status: false, message: "CART_NOT_FOUND" });
    }

    const cartData = await Promise.all(carts.map(async (cart) => {
      const user = await User.findById(cart.userId);
      if (!user) return null;

      const cartItems = await CartItem.find({ cartId: cart._id }).populate({
        path: "productId",
        select: "name price stocks"
      });

      const updatedTotalPrice = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
      if (cart.total_price !== updatedTotalPrice) {
        cart.total_price = updatedTotalPrice;
        await cart.save();
      }

      return {
        cartId: cart._id,
        total_price: cart.total_price,
        shipping_address: cart.shipping_address,
        status: cart.status,
        user: {
          fullname: user.fullname,
          email: user.email,
        },
        cart_items: cartItems.map(item => ({
          product_name: item.productId?.name,
          product_price: item.productId?.price,
          product_stocks: item.productId?.stocks,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      };
    }));

    const filteredData = cartData.filter(Boolean); // Hapus data user null
    if (filteredData.length === 0) {
      return res.status(404).json({ status: false, message: "CART_NOT_FOUND" });
    }

    return res.status(200).json({
      status: true,
      message: "CART_FOUND",
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    return res.status(error.code || 500).json({ status: false, message: error.message });
  }
}

  // 🔍 Menampilkan detail keranjang berdasarkan ID keranjang
  async getCartById(req, res) {
    try {
         if (!req.params.id) {
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
   
         const cartItem = await CartItem.find({
           cartId: req.params.id,
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
  

  // 🔍 Menampilkan semua keranjang milik user tertentu
async getCartByUserId(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ status: false, message: "USER_ID_REQUIRED" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "USER_NOT_FOUND" });
    }

    const carts = await Cart.find({ userId });
    if (!carts || carts.length === 0) {
      return res.status(404).json({ status: false, message: "CART_NOT_FOUND" });
    }

    const cartData = await Promise.all(carts.map(async (cart) => {
      const cartItems = await CartItem.find({ cartId: cart._id }).populate({
        path: "productId",
        select: "name price stocks"
      });

      const updatedTotalPrice = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
      if (cart.total_price !== updatedTotalPrice) {
        cart.total_price = updatedTotalPrice;
        await cart.save();
      }

      return {
        cartId: cart._id,
        total_price: cart.total_price,
        shipping_address: cart.shipping_address,
        status: cart.status,
        cart_items: cartItems.map(item => ({
          product_name: item.productId?.name,
          product_price: item.productId?.price,
          product_stocks: item.productId?.stocks,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      };
    }));

    return res.status(200).json({
      status: true,
      message: "CART_FOUND",
      data: {
        user: {
          fullname: user.fullname,
          email: user.email,
        },
        userId: user._id,
        count: cartData.length,
        carts: cartData,
      },
    });
  } catch (error) {
    return res.status(error.code || 500).json({ status: false, message: error.message });
  }
}

  // ✏️ Update cart (alamat, total, status) berdasarkan ID
  async putCart(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ status: false, message: "CART_ID_REQUIRED" });
      }

      const cart = await Cart.findById(id);
      if (!cart) {
        return res.status(404).json({ status: false, message: "CART_NOT_FOUND" });
      }

      const updatedCart = await Cart.findByIdAndUpdate(
        id,
        {
          total_price: req.body.total_price,
          shipping_address: req.body.shipping_address,
          status: req.body.status,
        },
        { new: true }
      );

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
      return res.status(error.code || 500).json({ status: false, message: error.message });
    }
  }

  // 🗑 Menghapus cart berdasarkan ID
  async deleteCart(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ status: false, message: "CART_ID_REQUIRED" });
      }

      const cart = await Cart.findById(id);
      if (!cart) {
        return res.status(404).json({ status: false, message: "CART_NOT_FOUND" });
      }

      await Cart.findByIdAndDelete(id);

      return res.status(200).json({ status: true, message: "CART_DELETE_SUCCESS" });
    } catch (error) {
      return res.status(error.code || 500).json({ status: false, message: error.message });
    }
  }
}

export default new CartController();