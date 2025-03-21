import Product from "../models/Products.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import fs from "fs";
import path from "path";

class ProductController {
  async getProduct(req, res) {
    try {
      let { category, brand, minPrice, maxPrice, page, limit } = req.query;
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
        data: products,
      });
    } catch (error) {
      return res
        .status(error.code || 500)
        .json({ status: false, message: error.message });
    }
  }
  async postProduct(req, res) {
    try {
        const {name, description, categoryId, brandId, price, location, stocks} = req.body;
        const images = req.files.map((file)=> `/uploads/${file.filename}`);
        const newProduct = new Product({
            name,
            description,
            categoryId : categoryId.split(","),
            brandId,
            price,
            location,
            stocks,
            images
        });
        await newProduct.save();
        res.json({
            status: true,
            message: "UPDATE_PRODUCT_SUCCESS",
            data: newProduct,
        });
    }catch (error) {
        return res
          .status(error.code || 500)
          .json({ status: false, message: error.message });
      }
  }
  async putProduct(req, res) {
    try {
        const {name, description, categoryId, brandId, price, location, stocks} = req.body; 
        const product = await Product.findOne({_id: req.params.id});
        if(!product) throw {code: 404, message: "PRODUCT_NOT_FOUND"};
        if(req.files.length >0){
            product.images.forEach((image)=>{
                const filePath = path.join(__dirname, `../uploads/${image}`);
                if(fs.existsSync(filePath)){
                    fs.unlinkSync(filePath);
                }
            });
            product.images = req.files.map((file)=> `/uploads/${file.filename}`);
        }
        product.name = name || product.name;
        product.description = description || product.description;
        product.categoryId = categoryId ?  categoryId.split(",") : product.categoryId; 
        product.brandId = brandId || product.brandId;
        product.price = price || product.price;
        product.location = location || product.location;
        product.stocks = stocks || product.stocks;
        await product.save();
        res.json({
            status: true,
            message: "UPDATE_PRODUCT_SUCCESS",
            data: product,
        });
    } catch (error) {
        res.status(error.code || 500).json({status: false, message: error.message});
    }
  }
}

export default new ProductController();
