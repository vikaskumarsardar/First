const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    category: String,
    image : String,
    merchantId : {
      type : mongoose.Types.ObjectId,
      ref : "Merchant"
    },
    
  },
  {
    timestamps: true,
  }
);

const categoryModel = mongoose.model("Category", categorySchema);
module.exports = categoryModel;
