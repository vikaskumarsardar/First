const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    items: [{ type: Object, default: {} }],
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
    },
    total: { type: Number, default: 0 },
    status: { type: String, default: "" },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    orderId : {
      type : Number,
      default :Math.ceil(1E9 * Math.random()) 
    },
    isCanceled : {
      type : Boolean,
      default : false
    }

  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("Orders", orderSchema);
module.exports = orderModel;
