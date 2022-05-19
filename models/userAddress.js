const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  City: String,
  State: String,
  Country: String,
  ZipCode: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  UserId: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
  },
});

const addressModel = mongoose.model("userAddress", addressSchema);
module.exports = addressModel;
