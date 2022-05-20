const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    productName: String,
    brand: String,
    price: Number,
    oldPrice: String,
    quantity: Number,
    ratings: Number,
    image: String,
    description: String,
    discount: { discountType: String, discount: Number },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    subCategoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Subcategory",
    },
    merchantId: {
      type: mongoose.Types.ObjectId,
      ref: "Merchant",
    },
  },
  {
    timestamps: true,
  }
);

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;
