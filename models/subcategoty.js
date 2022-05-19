const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema(
  {
    name: String,
    image : String,
    merchantId: {
      type: mongoose.Types.ObjectId,
      ref: "Merchant",
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

const subcategoryModel = mongoose.model("Subcategory", subCategorySchema);
module.exports = subcategoryModel;
