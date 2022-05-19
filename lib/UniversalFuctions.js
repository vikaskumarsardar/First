const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { constants } = require("../constants/");

exports.isValid = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId);
};

exports.generateJWTToken = async (payload) => {
  try {
    const token = await jwt.sign(payload, process.env.SECRET, {
      expiresIn: constants.expiresIn,
    });
    return token;
  } catch (err) {
    throw err;
  }
};
