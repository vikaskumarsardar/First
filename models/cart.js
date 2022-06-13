const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    items: [{ type: Object, default: {} }],
    chargeId: {
      type: mongoose.Types.ObjectId,
      ref: "Charges",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
    },
    isPlaced : {
      type : Boolean,
      default : false
    },
    deliveryCharges : {
      type : Number,
      default : 0
    }
  },
  {
    timestamps: true,
  }
);

const cartModel = mongoose.model("Cart", cartSchema);
module.exports = cartModel;
