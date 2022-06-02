const mongoose = require("mongoose");
const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: Number, default: 0 },
    countryCode: { type: String, default: "" },
    username: { type: String, default: "" },
    location: {
      type : {
        type : String,
        default : "Point"
      },
      coordinates :{
        type : Array,
        default : [{type : Number,default : 0}]
      } 
    },
    
    firstname: { type: String, default: "" },
    email: { type: String, default: "" },
    image: { type: String, default: "" },
    encryptedPassword: { type: String, default: "" },
    salt: { type: String, default: "" },
    accessToken: { type: String, default: "" },
    expireTokenIn: { type: Number, default: 0 },
    resetToken: { type: String, default: "" },
    isMerchant : {
      type : Boolean,
      default : true
    },
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

require("./virtual")(merchantSchema);
const merchantModel = mongoose.model("Merchant", merchantSchema);
module.exports = merchantModel;
