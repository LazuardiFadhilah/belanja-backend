import express from "express";
import AuthController from "../controllers/AuthController.js";
import productController from "../controllers/productController.js";
import jwtAuth from "../middleware/jwtAuth.js";
import upload from "../config/mutlerConfig.js";

const router = express.Router();

// Route untuk registrasi pengguna
router.post("/register", AuthController.register);

// Route untuk login pengguna
router.post("/login", AuthController.login);

// Route untuk refresh token
router.post("/refresh-token", jwtAuth, AuthController.refreshToken);

// Route untuk memperbarui profil pengguna
router.put("/user/:id", jwtAuth, AuthController.updateProfile);

// Route untuk mengunggah foto profil pengguna
router.post(
    "/user/:id/profile-picture",
    AuthController.upload.single("profilePicture"),
    AuthController.updateProfilePicture
);

// Route untuk mendapatkan produk
router.get("/products/:id?", jwtAuth, productController.getProduct);

// Route untuk menambahkan produk baru
router.post("/product", jwtAuth, upload.array("images", 5), productController.postProduct);

// Route untuk memperbarui produk yang ada
router.put("/product/:id", jwtAuth, upload.array("images", 5), productController.putProduct);
router.delete("/product/:id", jwtAuth, productController.deleteProduct);
export default router;
