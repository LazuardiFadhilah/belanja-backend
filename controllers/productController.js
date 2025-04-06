import Product from "../models/Products.js";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import path, { dirname } from "path";
import fs from "fs";
import configureMulter from "../config/multerConfig.js";

// Gunakan konfigurasi multer khusus untuk produk
const uploadProduct = configureMulter("uploads/productImages/");

class ProductController {
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      let { category, brand, minPrice, maxPrice, page, limit } = req.query;
      
      if (id) {
        // Jika ada ID, ambil produk berdasarkan ID
        const product = await Product.findById(id)
          .populate("categoryId", "title")
          .populate("brandId", "title image");

        if (!product) throw { code: 404, message: "PRODUCT_NOT_FOUND" };

        return res.json({
          status: true,
          message: "GET_PRODUCT_SUCCESS",
          data: {
            id: product._id,
            name: product.name,
            description: product.description,
            category: {
              id: product.categoryId._id,
              title: product.categoryId.title,
            },
            price: product.price,
            location: product.location,
            stocks: product.stocks,
            brand: {
              id: product.brandId._id,
              title: product.brandId.title,
              image: product.brandId.image,
            },
            images: product.images,
          },
          
        });
      }

      // Jika tidak ada ID, ambil semua produk dengan filter
      const filter = {};
      if (category) filter.categoryId = category;
      if (brand) filter.brandId = brand;
      if (minPrice) filter.price = { $gte: minPrice };
      if (maxPrice) filter.price = { ...filter.price, $lte: maxPrice };
      
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const skip = (page - 1) * limit;

      const products = await Product.find(filter)
        .populate("categoryId", "title")
        .populate("brandId", "title image")
        .skip(skip)
        .limit(limit);

      res.json({
        status: true,
        message: "GET_PRODUCTS_SUCCESS",
        data: products.map((product) => ({
          id: product._id,
            name: product.name,
            description: product.description,
            category: {
              id: product.categoryId._id,
              title: product.categoryId.title,
            },
            price: product.price,
            location: product.location,
            stocks: product.stocks,
            brand: {
              id: product.brandId._id,
              title: product.brandId.title,
              image: product.brandId.image,
            },
            images: product.images,
        })),  
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }
  async postProduct(req, res) {
    try {
      const {
        name,
        description,
        categoryId,
        brandId,
        price,
        location,
        stocks,
      } = req.body;
      const images = req.files
        ? req.files.map((file) => `/uploads/productImages/${file.filename}`)
        : [];
      const categories = categoryId
        ? categoryId.split(",").map((id) => id.trim())
        : [];
      const newProduct = new Product({
        name,
        description,
        categoryId: categories,
        brandId,
        price,
        location,
        stocks,
        images,
      });
      await newProduct.save();
      res.json({
        status: true,
        message: "UPDATE_PRODUCT_SUCCESS",
        data: newProduct,
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }
  async putProduct(req, res) {
    try {
      const {
        name,
        description,
        categoryId,
        brandId,
        price,
        location,
        stocks,
        removeImages,
      } = req.body;

      // ✅ Cari produk berdasarkan ID
      const product = await Product.findOne({ _id: req.params.id });
      if (!product) throw { code: 404, message: "PRODUCT_NOT_FOUND" };

      // ✅ Pastikan removeImages berupa array
      const imagesToRemove = Array.isArray(removeImages) ? removeImages : [];

      // ✅ Hapus gambar dari folder & database
      if (imagesToRemove.length > 0) {
        imagesToRemove.forEach((image) => {
          const filename = image.replace("/uploads/productImages/", ""); // Hapus path prefix
          const filePath = path.join(process.cwd(), `uploads/productImages/`, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Hapus dari folder
          } else {
            throw { code: 404, message: `IMAGE_NOT_FOUND: ${image}` }; // Jika gambar tidak ada, lempar error
          }
        });

        // ✅ Hapus gambar dari database setelah dihapus dari folder
        product.images = product.images.filter(
          (image) => !imagesToRemove.includes(image)
        );
      }

      // ✅ Tambahkan gambar baru dengan FIFO (maksimal 5 gambar)
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `/uploads/productImages/${file.filename}`);
        product.images = [...product.images, ...newImages];

        // Jika lebih dari 5 gambar, hapus gambar pertama (FIFO)
        while (product.images.length > 5) {
          const imageToDelete = product.images.shift();
          const filename = imageToDelete.replace("/uploads/productImages/", "");
          const filePath = path.join(process.cwd(), `uploads/productImages/`, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      // ✅ Perbarui data produk
      product.name = name || product.name;
      product.description = description || product.description;
      product.categoryId = categoryId
        ? categoryId.split(",")
        : product.categoryId;
      product.brandId = brandId || product.brandId;
      product.price = price || product.price;
      product.location = location || product.location;
      product.stocks = stocks || product.stocks;

      // ✅ Simpan perubahan ke database
      await product.save();

      res.json({
        status: true,
        message: "UPDATE_PRODUCT_SUCCESS",
        data: product,
      });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const product = await Product.findOne({ _id: req.params.id });
      if (!product) throw { code: 404, message: "PRODUCT_NOT_FOUND" };

      product.images.forEach((image) => {
        const filename = image.replace("/uploads/productImages/", "");
        const filePath = path.join(process.cwd(), `uploads/productImages/`, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      await Product.deleteOne({ _id: req.params.id });
      res.json({
        status: true,
        message: "DELETE_PRODUCT_SUCCESS",
      });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }
}

export { uploadProduct };
export default new ProductController();
