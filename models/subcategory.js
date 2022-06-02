const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema(
  {
    name: {type:String,default:""},
    image: {type:String,default:""},
    description : {type:String,default:""},
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
    discountType: {type:String,default:""},
    discount: {type:Number,default: 0},

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
