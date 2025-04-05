// Import dependencies dan controller
import express from "express";
import AuthController from "../controllers/AuthController.js";
import productController, { uploadProduct } from "../controllers/productController.js";
import categoryController from "../controllers/categoryController.js";
import brandController, { uploadBrand } from "../controllers/brandController.js";
import CartController from "../controllers/cartController.js";
import CartItemController from "../controllers/cartItemController.js";
import jwtAuth from "../middleware/jwtAuth.js";

const router = express.Router();

// =========================
// AUTHENTICATION ROUTES
// =========================

// Registrasi pengguna
router.post("/register", AuthController.register);

// Login pengguna
router.post("/login", AuthController.login);

// Refresh token (memerlukan autentikasi)
router.post("/refresh-token", jwtAuth, AuthController.refreshToken);

// Perbarui profil pengguna (memerlukan autentikasi)
router.put("/user/:id", jwtAuth, AuthController.updateProfile);

// Upload foto profil pengguna
router.post(
  "/user/:id/profile-picture",
  AuthController.upload.single("profilePicture"),
  AuthController.updateProfilePicture
);

// =========================
// PRODUCT ROUTES
// =========================

// Dapatkan satu atau semua produk (memerlukan autentikasi)
router.get("/products/:id?", jwtAuth, productController.getProduct);

// Tambah produk baru (max 5 gambar, memerlukan autentikasi)
router.post(
  "/product",
  jwtAuth,
  uploadProduct.array("images", 5),
  productController.postProduct
);

// Perbarui produk (max 5 gambar, memerlukan autentikasi)
router.put(
  "/product/:id",
  jwtAuth,
  uploadProduct.array("images", 5),
  productController.putProduct
);

// Hapus produk (memerlukan autentikasi)
router.delete("/product/:id", jwtAuth, productController.deleteProduct);

// =========================
// CATEGORY ROUTES
// =========================

// Tambah kategori baru (memerlukan autentikasi)
router.post("/category", jwtAuth, categoryController.postCategory);

// Dapatkan satu atau semua kategori (memerlukan autentikasi)
router.get("/category/:id?", jwtAuth, categoryController.getCategory);

// Perbarui kategori (memerlukan autentikasi)
router.put("/category/:id", jwtAuth, categoryController.updateCategory);

// Hapus kategori (memerlukan autentikasi)
router.delete("/category/:id", jwtAuth, categoryController.deleteCategory);

// =========================
// BRAND ROUTES
// =========================

// Tambah brand baru (dengan upload gambar, memerlukan autentikasi)
router.post(
  "/brand",
  jwtAuth,
  uploadBrand.single("image"),
  brandController.postBrand
);

// Perbarui brand (dengan upload gambar, memerlukan autentikasi)
router.put(
  "/brand/:id",
  jwtAuth,
  uploadBrand.single("image"),
  brandController.updateBrand
);

// Dapatkan satu atau semua brand (memerlukan autentikasi)
router.get("/brand/:id?", jwtAuth, brandController.getBrand);

// Hapus brand (memerlukan autentikasi)
router.delete("/brand/:id", jwtAuth, brandController.deleteBrand);

// =========================
// CART ROUTES
// =========================

// Buat keranjang baru untuk user tertentu (memerlukan autentikasi)
router.post("/cart/:userId", jwtAuth, CartController.postCart);

// Dapatkan semua cart
router.get("/cart", jwtAuth, CartController.getCart);

// Dapatkan cart berdasarkan ID
router.get("/cart/:id", jwtAuth, CartController.getCartById);

// Dapatkan cart berdasarkan user ID
router.get("/cart/user/:userId", jwtAuth, CartController.getCartByUserId);

// Perbarui cart
router.put("/cart/:id", jwtAuth, CartController.putCart);

// Hapus cart
router.delete("/cart/:id", jwtAuth, CartController.deleteCart);


// =========================
// CART ITEMS ROUTES
// =========================
router.post("/cart/:CartId/cart-item", jwtAuth, CartItemController.createCartItem);
export default router;
