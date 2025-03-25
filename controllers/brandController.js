import path from "path";
import fs from "fs";
import Brand from "../models/Brand.js";
import configureMulter from "../config/multerConfig.js"; // Middleware multer

// Inisialisasi multer untuk brand images
const uploadBrand = configureMulter("uploads/brandImages");

class BrandController {
    // ==============================
    //  GET ALL BRANDS OR SINGLE BRAND
    // ==============================
    async getBrand(req, res) {
        try {
            // Jika tidak ada ID, ambil semua brand
            if (!req.params.id) {
                const brands = await Brand.find();
                const formattedBrands = brands.map((brand) => ({
                    id: brand._id,
                    title: brand.title,
                    image: brand.image,
                }));
                return res.json({
                    status: true,
                    message: "GET_BRANDS_SUCCESS",
                    data: {
                        count: brands.length,
                        formattedBrands,
                    },
                });
            }

            // Jika ada ID, ambil brand berdasarkan ID
            const brand = await Brand.findById(req.params.id);
            if (!brand) throw { code: 404, message: "BRAND_NOT_FOUND" };

            res.json({
                status: true,
                message: "GET_BRAND_SUCCESS",
                data: {
                    id: brand._id,
                    title: brand.title,
                    image: brand.image,
                },
            });
        } catch (error) {
            return res
                .status(error.code || 500)
                .json({ status: false, message: error.message });
        }
    }

    // ==============================
    //  CREATE A NEW BRAND
    // ==============================
    async postBrand(req, res) {
        try {
            // Validasi input title harus ada
            if (!req.body.title) {
                throw { code: 400, message: "TITLE_REQUIRED" };
            }

            // Ambil URL gambar yang diunggah jika ada
            const imageUrl = req.file ? `/uploads/brandImages/${req.file.filename}` : null;

            // Simpan brand ke database
            const brand = await Brand.create({ 
                title: req.body.title,
                image: imageUrl,
            });

            if (!brand) throw { code: 500, message: "BRAND_CREATE_FAILED" };

            return res.status(200).json({
                status: true,
                message: "BRAND_CREATE_SUCCESS",
                data: brand,
            });
        } catch (error) {
            return res
                .status(error.code || 500)
                .json({ status: false, message: error.message });
        }
    }

    // ==============================
    //  UPDATE BRAND
    // ==============================
    async updateBrand(req, res) {
        try {
            const { title } = req.body;

            // Cari brand berdasarkan ID
            const brand = await Brand.findById(req.params.id);
            if (!brand) throw { code: 404, message: "BRAND_NOT_FOUND" };

            // Simpan path gambar lama
            const oldImage = brand.image;

            // Jika pengguna ingin menghapus gambar tanpa menggantinya
            if (!req.file && req.body.image === "") {
                if (oldImage) {
                    const filename = oldImage.replace("/uploads/brandImages/", "");
                    const filepath = path.join(process.cwd(), "uploads/brandImages", filename);
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath); // Hapus file dari folder
                    }
                }
                brand.image = null; // Set gambar ke null di database
            }

            // Jika ada file baru diunggah, hapus gambar lama lalu simpan yang baru
            if (req.file) {
                if (oldImage) {
                    const filename = oldImage.replace("/uploads/brandImages/", "");
                    const filepath = path.join(process.cwd(), "uploads/brandImages", filename);
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath); // Hapus file lama
                    }
                }
                brand.image = `/uploads/brandImages/${req.file.filename}`; // Simpan file baru
            }

            // Perbarui title jika ada perubahan
            brand.title = title || brand.title;

            // Simpan perubahan ke database
            await brand.save();

            res.json({
                status: true,
                message: "BRAND_UPDATE_SUCCESS",
                data: brand,
            });
        } catch (error) {
            res.status(error.code || 500).json({ status: false, message: error.message });
        }
    }

    // ==============================
    //  DELETE BRAND
    // ==============================
    async deleteBrand(req, res) {
        try {
            // Validasi ID harus ada
            if (!req.params.id) throw { code: 400, message: "ID_REQUIRED" };

            // Cari brand berdasarkan ID
            const brand = await Brand.findById(req.params.id);
            if (!brand) throw { code: 404, message: "BRAND_NOT_FOUND" };

            // Hapus gambar dari folder jika ada
            if (brand.image) {
                const filename = brand.image.replace("/uploads/brandImages/", "");
                const filePath = path.join(process.cwd(), "uploads/brandImages", filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Hapus file dari folder
                }
            }

            // Hapus brand dari database
            await Brand.deleteOne({ _id: req.params.id });

            res.json({
                status: true,
                message: "BRAND_DELETE_SUCCESS",
            });
        } catch (error) {
            return res
                .status(error.code || 500)
                .json({ status: false, message: error.message });
        }
    }
}

// Menggunakan multer sebagai middleware untuk menangani form-data
export { uploadBrand };
export default new BrandController();