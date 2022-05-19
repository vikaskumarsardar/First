const mongoose = require("mongoose");
const merchantSchema = new mongoose.Schema(
  {
    name: String,
    phone: Number,
    email: String,
    image : String,
    encryptedPassword: String,
    salt: String,
    accessToken : String,
    adminId: {
      type: mongoose.Types.ObjectId,
      ref: "Admin",
    },
    isBLocked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
  );
  
  require('./virtual')(merchantSchema)
  const merchantModel = mongoose.model("Merchant", merchantSchema);
module.exports = merchantModel;
