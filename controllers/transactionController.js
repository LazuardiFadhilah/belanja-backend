import User from "../models/User.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Transaction from "../models/Transactions.js";
import TransactionItem from "../models/TransactionItems.js";
import ShippingAddress from "../models/ShippingAddress.js";
import snap from "./midtrans.js";
import Products from "../models/Products.js";

class TransactionController {
    async postTransaction(req, res) {
        try {
          // 🔐 1. Autentikasi user
          const user = await User.findById(req.jwt.id);
          if (!user) {
            return res.status(401).json({
              status: false,
              message: "UNAUTHORIZED",
            });
          }
      
          // 🛒 2. Ambil cart aktif user
          const cart = await Cart.findOne({
            userId: req.jwt.id,
            status: "active",
          });
          if (!cart) {
            return res.status(404).json({
              status: false,
              message: "CART_NOT_FOUND",
            });
          }
      
          // 🧺 3. Ambil semua item di cart
          const cartItem = await CartItem.find({ cartId: cart._id });
          if (!cartItem || cartItem.length === 0) {
            return res.status(404).json({
              status: false,
              message: "CART_ITEM_NOT_FOUND",
            });
          }
      
          // 💰 4. Hitung ulang total harga dari item
          const updatedTotalPrice = cartItem.reduce(
            (acc, item) => acc + item.subtotal,
            0
          );
      
          // 🔄 5. Update harga total jika ada perubahan
          if (cart.total_price !== updatedTotalPrice) {
            cart.total_price = updatedTotalPrice;
            await cart.save();
          }
      
          // 🧾 6. Buat order ID unik
          const orderId =
            "ORDER-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      
          // 💳 7. Buat transaksi di Midtrans
          const midtransRes = await snap.createTransaction({
            transaction_details: {
              order_id: orderId,
              gross_amount: updatedTotalPrice,
            },
            credit_card: {
              secure: true,
            },
            customer_details: {
              first_name: user.name,
              email: user.email,
            },
          });
      
          // 🗂️ 8. Simpan transaksi ke database
          const transaction = await Transaction.create({
            userId: user._id,
            cartId: cart._id,
            totalPrice: updatedTotalPrice,
            status: "pending",
            paymentId: orderId,
            paymentUrl: midtransRes.redirect_url,
          });
          if (!transaction) {
            return res.status(500).json({
              status: false,
              message: "TRANSACTION_FAILED",
            });
          }
      
          // ✅ 9. Tandai cart sudah selesai (opsional: bisa juga "processed")
          const updateCart = await Cart.findByIdAndUpdate(
            cart._id,
            { status: "checkout" },
            { new: true }
          );
          if (!updateCart) {
            return res.status(500).json({
              status: false,
              message: "CART_UPDATE_FAILED",
            });
          }
      
          // 🧾 10. Masukkan semua item ke TransactionItem
          const transactionItems = cartItem.map((item) => ({
            transactionId: transaction._id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }));
          const transactionItem = await TransactionItem.insertMany(transactionItems);
          if (!transactionItem) {
            return res.status(500).json({
              status: false,
              message: "TRANSACTION_ITEM_FAILED",
            });
          }

          // Ambil data produk dari transactionItems
          const enrichedTransactionItems = await Promise.all(
            transactionItems.map(async (item) => {
                const product = await Products.findById(item.productId);
                return{
                   product: product?.name,
                   quantity: item.quantity,
                   price: item.price,
                   total_price: item.price * item.quantity,
                }
            }
          ));

          const shippingAddress = await ShippingAddress.findById(transaction.shippingId);
      
          // 📤 11. Kirim response sukses
          return res.status(201).json({
            status: true,
            message: "TRANSACTION_SUCCESS",
            data: {
              transactionId: transaction._id,
              subtotal: updatedTotalPrice,
              user:{
                name: user.fullname,
                shippingAddress: shippingAddress ? shippingAddress.address : null,
              },
              transaction_items:enrichedTransactionItems,
              paymentUrl: midtransRes.redirect_url,
            },
          });
      
        } catch (error) {
          // 🧨 12. Tangani error
          return res
            .status(error.code || 500)
            .json({ status: false, message: error.message });
        }
      }

      async getTransaction(req, res) {
        try {
          // ✅ 1. Ambil ID transaksi dari params
          const transactionId = req.params.id;
          if (!transactionId) {
            return res.status(400).json({
              status: false,
              message: "TRANSACTION_ID_REQUIRED",
            });
          }
      
          // ✅ 2. Cari transaksi berdasarkan ID
          const transaction = await Transaction.findById(transactionId);
          if (!transaction) {
            return res.status(404).json({
              status: false,
              message: "TRANSACTION_NOT_FOUND",
            });
          }
      
          // ✅ 3. Ambil alamat pengiriman jika ada
          const shippingAddress = transaction.shippingId
            ? await ShippingAddress.findById(transaction.shippingId)
            : null;
      
          // ✅ 4. Ambil data user dari transaksi
          const user = await User.findById(transaction.userId);
          if (!user) {
            return res.status(404).json({
              status: false,
              message: "USER_NOT_FOUND",
            });
          }
      
          // ✅ 5. Ambil semua item dari transaksi ini
          const transactionItems = await TransactionItem.find({
            transactionId: transaction._id,
          });
          if (!transactionItems || transactionItems.length === 0) {
            return res.status(404).json({
              status: false,
              message: "TRANSACTION_ITEM_NOT_FOUND",
            });
          }
      
          // ✅ 6. Enrich transaction items dengan nama produk
          const enrichedTransactionItems = await Promise.all(
            transactionItems.map(async (item) => {
              const product = await Products.findById(item.productId);
              return {
                product: product?.name || null,
                quantity: item.quantity,
                price: item.price,
                total_price: item.price * item.quantity,
              };
            })
          );
      
          // ✅ 7. Kirim response sukses
          return res.status(200).json({
            status: true,
            message: "TRANSACTION_FOUND",
            data: {
              transactionId: transaction._id,
              subtotal: transaction.totalPrice,
              user: {
                name: user.fullname,
                shipping_address: shippingAddress ? shippingAddress.address : null,
              },
              transaction_items: enrichedTransactionItems,
              paymentUrl: transaction.paymentUrl,
            },
          });
        } catch (error) {
          // 🧨 8. Tangani error
          return res
            .status(error.code || 500)
            .json({ status: false, message: error.message });
        }
      }
}

export default new TransactionController();
