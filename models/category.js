const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    description: String,
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
  },
  {
    timestamps: true,
  }
);

const categoryModel = mongoose.model("Category", categorySchema);
module.exports = categoryModel;
