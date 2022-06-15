const mongoose = require("mongoose");
const merchantAddressSchema = new mongoose.Schema({
  country: {
    type: String,
    default: "",
  },

  city: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  location: {
    type: "Point",
    coordinates: [
      25.1973, //latitude
      55.2793, //longitude
    ],
  },
});
