const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { constants } = require("../constants/");
const config = require('config')

exports.isValid = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId);
};

exports.generateJWTToken = async (payload) => {
  try {
    const token = await jwt.sign(payload,process.env.secret, {
      expiresIn: constants.expiresIn,
    });
    return token;
  } catch (err) {
    throw err;
  }
};
