import Category from "../models/Category.js";

class CategoryController {
    // Menambahkan kategori baru
    async postCategory(req, res) {
        try {
            // Validasi input: title harus diisi
            if (!req.body.title) {
                throw { code: 400, message: "TITLE_REQUIRED" };
            }

            // Membuat kategori baru
            const category = await Category.create({ title: req.body.title });
            if (!category) throw { code: 500, message: "CATEGORY_CREATE_FAILED" };

            return res.status(200).json({
                status: true,
                message: "CATEGORY_CREATE_SUCCESS",
                data: category,
            });
        } catch (error) {
            return res
                .status(error.code || 500)
                .json({ status: false, message: error.message });
        }
    }

    // Mendapatkan satu kategori berdasarkan ID atau semua kategori
    async getCategory(req, res) {
        try {
            if (req.params.id) {
                // Mencari kategori berdasarkan ID
                const category = await Category.findById(req.params.id);
                if (!category) throw { code: 404, message: "CATEGORY_NOT_FOUND" };

                return res.status(200).json({
                    status: true,
                    message: "CATEGORY_GET_BY_ID_SUCCESS",
                    data: {
                        id: category._id,
                        title: category.title,
                    },
                });
            }

            // Jika tidak ada ID, ambil semua kategori
            const categories = await Category.find();
            const formattedCategories = categories.map((category) => ({
                id: category._id,
                title: category.title,
            }));

            return res.status(200).json({
                status: true,
                message: "CATEGORY_GET_SUCCESS",
                data: formattedCategories,
            });
        } catch (error) {
            return res
                .status(error.code || 500)
                .json({ status: false, message: error.message });
        }
    }

    // Memperbarui kategori berdasarkan ID
    async updateCategory(req, res) {
        try {
            // Validasi input: title harus diisi
            if (!req.body.title) {
                throw { code: 400, message: "TITLE_REQUIRED" };
            }

            // Mengupdate kategori berdasarkan ID
            const category = await Category.findByIdAndUpdate(
                req.params.id,
                { title: req.body.title },
                { new: true } // Mengembalikan data terbaru setelah update
            );
            if (!category) throw { code: 500, message: "CATEGORY_UPDATE_FAILED" };

            return res.status(200).json({
                status: true,
                message: "CATEGORY_UPDATE_SUCCESS",
                data: category,
            });
        } catch (error) {
            return res
                .status(error.code || 500)
                .json({ status: false, message: error.message });
        }
    }

    // Menghapus kategori berdasarkan ID
    async deleteCategory(req, res) {
        try {
            const category = await Category.findByIdAndDelete(req.params.id);
            if (!category) throw { code: 404, message: "CATEGORY_NOT_FOUND" };

            return res.status(200).json({
                status: true,
                message: "CATEGORY_DELETE_SUCCESS",
                data: category,
            });
        } catch (error) {
            return res
                .status(error.code || 500)
                .json({ status: false, message: error.message });
        }
    }
}

export default new CategoryController();