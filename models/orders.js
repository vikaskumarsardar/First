const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    item: {type:String,default:""},
    price: {type:Number,default: 0},
    quantity : {type:Number,default: 0},
    total: {type:Number,default: 0},
    subTotal: {type:Number,default: 0},
    deliveryCharge: {type:Number,default: 0},
    status : {type:String,default:""},
    merchantId : {
      type : mongoose.Types.ObjectId,
      ref : "Merchant"
    },
    chargeId: {
      type: mongoose.Types.ObjectId,
      ref: "Charges",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("Orders", orderSchema);
module.exports = orderModel;
