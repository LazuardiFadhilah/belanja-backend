import User from "../models/User.js"; // Model User dari database
import emailExist from "../libraries/emailExist.js"; // Fungsi untuk mengecek apakah email sudah terdaftar
import bcrypt from "bcrypt"; // Library untuk hashing password
import jwt from "jsonwebtoken"; // Library untuk JWT (JSON Web Token)
import dotenv from "dotenv"; // Library untuk membaca file .env
import mongoose from "mongoose"; // Library untuk mengakses database MongoDB
import multer from "multer";
import path from "path";
import fs from "fs";

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

  // Konfigurasi multer untuk upload gambar
  constructor() {
    // Konfigurasi multer untuk upload gambar
    this.storage = multer.diskStorage({
      // Menentukan direktori penyimpanan file yang diupload
      destination: (req, file, cb) => {
        const uploadPath = "uploads/profile_pictures";
        
        // Cek apakah folder sudah ada, jika belum buat otomatis
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },

      // Menentukan nama file yang diupload
      filename: (req, file, cb) => {
        cb(null, `profile-${req.params.id}${path.extname(file.originalname)}`);
      },
    });

    this.upload = multer({ storage: this.storage });
  }

  // Metode register untuk mendaftarkan pengguna baru
  /**
   * Mendaftarkan pengguna baru dengan validasi input dan penyimpanan data.
   * @param {Object} req - Request object.
   * @param {Object} res - Response object.
   */
  async register(req, res) {
    try {
      // Validasi input
      if (!req.body.fullname) throw { code: 400, message: "FULLNAME_REQUIRED" };
      if (!req.body.email) throw { code: 400, message: "EMAIL_REQUIRED" };
      if (!req.body.password) throw { code: 400, message: "PASSWORD_REQUIRED" };
      if (req.body.password.length < 6)
        throw { code: 400, message: "PASSWORD_MIN_6_CHARACTERS" };

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
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  // Metode login untuk autentikasi pengguna
  /**
   * Mengautentikasi pengguna dan menghasilkan access token serta refresh token.
   * @param {Object} req - Request object.
   * @param {Object} res - Response object.
   */
  async login(req, res) {
    try {
      // Validasi input
      if (!req.body.email) throw { code: 400, message: "EMAIL_REQUIRED" };
      if (!req.body.password) throw { code: 400, message: "PASSWORD_REQUIRED" };

      // Cek apakah user ada di database
      const user = await User.findOne({ email: req.body.email });
      if (!user) throw { code: 400, message: "USER_NOT_FOUND" };

      // Cek apakah password sesuai
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
      );
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
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  // Metode untuk memperbarui profil pengguna
  /**
   * Memperbarui informasi pengguna berdasarkan ID.
   * @param {Object} req - Request object.
   * @param {Object} res - Response object.
   */
  async updateProfile(req, res) {
    try {
      // Validasi input
      if (!req.params.id) throw { code: 400, message: "ID_REQUIRED" };

      const { fullname, email, password } = req.body;

      // Pastikan ada data yang diperbarui
      if (!fullname && !email && !password)
        throw { code: 400, message: "NO_DATA_TO_UPDATE" };

      // Cari user berdasarkan ID
      const user = await User.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
      });
      if (!user) throw { code: 404, message: "USER_NOT_FOUND" };

      // Perbarui data yang diberikan
      if (fullname) user.fullname = fullname;
      if (email) {
        const isEmailExist = await emailExist(email);
        if (isEmailExist && email !== user.email)
          throw { code: 400, message: "EMAIL_EXIST" };
        user.email = email;
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      // Simpan perubahan
      await user.save();

      // Berikan respons sukses
      return res.status(200).json({
        status: true,
        message: "USER_UPDATED_SUCCESS",
        data: user,
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  // Metode untuk memperbarui access token dengan refresh token
  /**
   * Menghasilkan access token baru menggunakan refresh token yang valid.
   * @param {Object} req - Request object.
   * @param {Object} res - Response object.
   */
  async refreshToken(req, res) {
    try {
      // Validasi apakah refresh token disediakan
      if (!req.body.refreshToken) {
        return res
          .status(400)
          .json({ status: false, message: "REFRESH_TOKEN_REQUIRED" });
      }

      // Verifikasi refresh token
      const verify = await jwt.verify(
        req.body.refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

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
      if (error.message === "jwt expired")
        error.message = "REFRESH_TOKEN_EXPIRED";
      else if (
        [
          "invalid signature",
          "jwt signature is required",
          "jwt must be provided",
          "jwt malformed",
          "invalid token",
        ].includes(error.message)
      ) {
        error.message = "INVALID_REFRESH_TOKEN";
      }
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  // Controller update foto profil
  /**
   * Memperbarui foto profil pengguna.
   * @param {Object} req - Request object.
   * @param {Object} res - Response object.
   */
  async updateProfilePicture(req, res) {
    try {
      if (!req.file) throw { code: 400, message: "NO_FILE_UPLOADED" };

      const user = await User.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
      if (!user) throw { code: 404, message: "USER_NOT_FOUND" };
      
      // Hapus foto profil lama jika ada
      if (user.profile_pic) {
        const oldFilePath = path.join("uploads", user.profile_pic);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Hapus file lama
        }
      }

      // Simpan path foto baru
      user.profile_pic = `/uploads/profile_pictures/${req.file.filename}`;
      await user.save();

      return res.status(200).json({
        status: true,
        message: "PROFILE_PICTURE_UPDATED",
        data: { profilePicture: user.profile_pic },
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

// Ekspor instance dari AuthController
export default new AuthController();
