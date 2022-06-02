const mongoose = require("mongoose");
const chargeSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    serviceCharges: {
      type: Number,
      default: 0,
    },
    GST: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
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

const chargesModel = mongoose.model("Charges", chargeSchema);
module.exports = chargesModel;
