const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    productName: {type:String,default:""},
    brand: {type:String,default:""},
    price: {type:Number,default: 0},
    oldPrice: {type:String,default:""},
    image : {type:String,default:""},
    ratings: {type:Number,default: 0},
    description: {type:String,default:""},
    discountType: {type:String,default:""},
    discount: {type:Number,default: 0},
    isDeleted : {
      type : Boolean,
      default : false
    },
    isActive : {
      type : Boolean,
      default : true
    },
    isBlocked : {
      type : Boolean,
      default : false
    },
    deliveryCharges : {type:Number,default: 0},
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
