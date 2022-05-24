const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    description : String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    discountType: String,
    discount: Number,

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
    // toJSON: true,
    // toObject: true,
  }
);

const subcategoryModel = mongoose.model("Subcategory", subCategorySchema);
module.exports = subcategoryModel;
