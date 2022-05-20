const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBLocked: {
      type: Boolean,
      default: false,
    },
    discount: { discountType: String, discount: Number },

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
