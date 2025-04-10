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
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", jwtAuth, AuthController.refreshToken);
router.put("/user/:id", jwtAuth, AuthController.updateProfile);
router.post(
  "/user/:id/profile-picture",
  AuthController.upload.single("profilePicture"),
  AuthController.updateProfilePicture
);

// =========================
// PRODUCT ROUTES
// =========================
router.get("/products/:id?", jwtAuth, productController.getProduct);
router.post(
  "/product",
  jwtAuth,
  uploadProduct.array("images", 5),
  productController.postProduct
);
router.put(
  "/product/:id",
  jwtAuth,
  uploadProduct.array("images", 5),
  productController.putProduct
);
router.delete("/product/:id", jwtAuth, productController.deleteProduct);

// =========================
// CATEGORY ROUTES
// =========================
router.post("/category", jwtAuth, categoryController.postCategory);
router.get("/category/:id?", jwtAuth, categoryController.getCategory);
router.put("/category/:id", jwtAuth, categoryController.updateCategory);
router.delete("/category/:id", jwtAuth, categoryController.deleteCategory);

// =========================
// BRAND ROUTES
// =========================
router.post(
  "/brand",
  jwtAuth,
  uploadBrand.single("image"),
  brandController.postBrand
);
router.put(
  "/brand/:id",
  jwtAuth,
  uploadBrand.single("image"),
  brandController.updateBrand
);
router.get("/brand/:id?", jwtAuth, brandController.getBrand);
router.delete("/brand/:id", jwtAuth, brandController.deleteBrand);

// =========================
// CART ITEMS ROUTES (Diletakkan di atas route dengan param :id agar tidak bentrok)
// =========================
router.get("/cart/cart-item", jwtAuth, CartItemController.getAllCartItems);
router.post("/cart/:CartId/cart-item", jwtAuth, CartItemController.createCartItem);


// =========================
// CART ROUTES
// =========================
router.post("/cart/:userId", jwtAuth, CartController.postCart);
router.get("/cart", jwtAuth, CartController.getCart);
router.get("/cart/user/:userId", jwtAuth, CartController.getCartByUserId);
router.put("/cart/:id", jwtAuth, CartController.putCart);
router.delete("/cart/:id", jwtAuth, CartController.deleteCart);
router.get("/cart/:id", jwtAuth, CartController.getCartById); // Letakkan paling bawah
router.put("/cart-item/:cartItemId", jwtAuth, CartItemController.putCartItem);
router.delete("/cart-item/:cartItemId", jwtAuth, CartItemController.deleteCartItem);

export default router;