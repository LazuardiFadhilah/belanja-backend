import User from "../models/User.js"; // Model User dari database
import emailExist from "../libraries/emailExist.js"; // Fungsi untuk mengecek apakah email sudah terdaftar
import bcrypt from "bcrypt"; // Library untuk hashing password
import jwt from "jsonwebtoken"; // Library untuk JWT (JSON Web Token)
import dotenv from "dotenv"; // Library untuk membaca file .env

// Konfigurasi environment variables
dotenv.config();

// Fungsi untuk membuat access token JWT
const generateAccessToken = async (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_TIME,
  });
};

// Fungsi untuk membuat refresh token JWT
const generateRefreshToken = async (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_TIME,
  });
};

// Kelas AuthController untuk mengelola autentikasi pengguna
class AuthController {
  // Metode register untuk mendaftarkan pengguna baru
  async register(req, res) {
    try {
      // Validasi input
      if (!req.body.fullname) throw { code: 400, message: "FULLNAME_REQUIRED" };
      if (!req.body.email) throw { code: 400, message: "EMAIL_REQUIRED" };
      if (!req.body.password) throw { code: 400, message: "PASSWORD_REQUIRED" };
      if (req.body.password.length < 6) throw { code: 400, message: "PASSWORD_MIN_6_CHARACTERS" };

      // Cek apakah email sudah terdaftar
      const isEmailExist = await emailExist(req.body.email);
      if (isEmailExist) throw { code: 400, message: "EMAIL_EXIST" };

      // Hash password sebelum disimpan ke database
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);

      // Buat user baru
      const user = await User.create({
        fullname: req.body.fullname,
        email: req.body.email,
        password: hash,
        role: req.body.role || "customer",
      });

      if (!user) throw { code: 500, message: "USER_REGISTER_FAILED" };

      // Berikan response sukses
      return res.status(200).json({
        status: true,
        message: "USER_REGISTER_SUCCESS",
        data: user,
      });
    } catch (error) {
      return res.status(error.code || 500).json({ status: false, message: error.message });
    }
  }

  // Metode login untuk autentikasi pengguna
  async login(req, res) {
    try {
      // Validasi input
      if (!req.body.email) throw { code: 400, message: "EMAIL_REQUIRED" };
      if (!req.body.password) throw { code: 400, message: "PASSWORD_REQUIRED" };

      // Cek apakah user ada di database
      const user = await User.findOne({ email: req.body.email });
      if (!user) throw { code: 400, message: "USER_NOT_FOUND" };

      // Cek apakah password sesuai
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordValid) throw { code: 400, message: "PASSWORD_INVALID" };

      // Buat access token dan refresh token
      const accessToken = await generateAccessToken({ id: user._id });
      const refreshToken = await generateRefreshToken({ id: user._id });

      // Berikan response sukses dengan token
      return res.status(200).json({
        status: true,
        message: "LOGIN_SUCCESS",
        data: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return res.status(error.code || 500).json({ status: false, message: error.message });
    }
  }

  // Metode untuk memperbarui access token dengan refresh token
  async refreshToken(req, res) {
    try {
      // Validasi apakah refresh token disediakan
      if (!req.body.refreshToken) {
        return res.status(400).json({ status: false, message: "REFRESH_TOKEN_REQUIRED" });
      }

      // Verifikasi refresh token
      const verify = await jwt.verify(req.body.refreshToken, process.env.JWT_REFRESH_SECRET);

      // Buat token baru
      const payload = { id: verify.id };
      const accessToken = await generateAccessToken(payload);
      const refreshToken = await generateRefreshToken(payload);

      // Berikan response sukses dengan token baru
      return res.status(200).json({
        status: true,
        message: "REFRESH_TOKEN_SUCCESS",
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      // Menyesuaikan pesan error untuk kesalahan token
      if (error.message === "jwt expired") error.message = "REFRESH_TOKEN_EXPIRED";
      else if (
        ["invalid signature", "jwt signature is required", "jwt must be provided", "jwt malformed", "invalid token"].includes(error.message)
      ) {
        error.message = "INVALID_REFRESH_TOKEN";
      }
      return res.status(error.code || 500).json({ status: false, message: error.message });
    }
  }
}

// Ekspor instance dari AuthController
export default new AuthController();
