import express from "express";
import AuthController from "../controllers/AuthController.js";
import productController, { uploadProduct } from "../controllers/productController.js";
import categoryController from "../controllers/categoryController.js";
import brandController, { uploadBrand } from "../controllers/brandController.js";
import jwtAuth from "../middleware/jwtAuth.js";

const router = express.Router();

// =========================
//  AUTHENTICATION ROUTES
// =========================

// Route untuk registrasi pengguna
router.post("/register", AuthController.register);

// Route untuk login pengguna
router.post("/login", AuthController.login);

// Route untuk refresh token (memerlukan autentikasi)
router.post("/refresh-token", jwtAuth, AuthController.refreshToken);

// Route untuk memperbarui profil pengguna (memerlukan autentikasi)
router.put("/user/:id", jwtAuth, AuthController.updateProfile);

// Route untuk mengunggah foto profil pengguna
router.post(
  "/user/:id/profile-picture",
  AuthController.upload.single("profilePicture"),
  AuthController.updateProfilePicture
);

// =========================
//  PRODUCT ROUTES
// =========================

// Route untuk mendapatkan satu atau semua produk (memerlukan autentikasi)
router.get("/products/:id?", jwtAuth, productController.getProduct);

// Route untuk menambahkan produk baru (memerlukan autentikasi dan bisa mengunggah hingga 5 gambar)
router.post(
  "/product",
  jwtAuth,
  uploadProduct.array("images", 5),
  productController.postProduct
);

// Route untuk memperbarui produk (memerlukan autentikasi dan bisa mengunggah hingga 5 gambar)
router.put(
  "/product/:id",
  jwtAuth,
  uploadProduct.array("images", 5),
  productController.putProduct
);

// Route untuk menghapus produk (memerlukan autentikasi)
router.delete("/product/:id", jwtAuth, productController.deleteProduct);

// =========================
//  CATEGORY ROUTES
// =========================

// Route untuk menambahkan kategori baru (memerlukan autentikasi)
router.post("/category", jwtAuth, categoryController.postCategory);

// Route untuk mendapatkan satu atau semua kategori (memerlukan autentikasi)
router.get("/category/:id?", jwtAuth, categoryController.getCategory);

// Route untuk memperbarui kategori (memerlukan autentikasi)
router.put("/category/:id", jwtAuth, categoryController.updateCategory);

// Route untuk menghapus kategori (memerlukan autentikasi)
router.delete("/category/:id", jwtAuth, categoryController.deleteCategory);

// =========================
//  BRAND ROUTES
// =========================

// Route untuk menambahkan brand baru (memerlukan autentikasi dan mengunggah gambar)
router.post(
  "/brand",
  jwtAuth,
  uploadBrand.single("image"),
  brandController.postBrand
);

// Route untuk memperbarui brand (memerlukan autentikasi dan mengunggah gambar)
router.put(
  "/brand/:id",
  jwtAuth,
  uploadBrand.single("image"),
  brandController.updateBrand
);

// Route untuk mendapatkan satu atau semua brand (memerlukan autentikasi)
router.get("/brand/:id?", jwtAuth, brandController.getBrand);

// Route untuk menghapus brand (memerlukan autentikasi)
router.delete("/brand/:id", jwtAuth, brandController.deleteBrand);

export default router;
