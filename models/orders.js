const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment')
const {connection} = require('../config/')

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
    },
    orderId : {
      type : Number
    }

  },
  {
    timestamps: true,
  }
);

autoIncrement.initialize(connection)
orderSchema.plugin(autoIncrement.plugin,{
model:"Orders",
field : "orderId",
startAt : 100000,
incrementBy : 1
})


const orderModel = mongoose.model("Orders", orderSchema);
module.exports = orderModel;
