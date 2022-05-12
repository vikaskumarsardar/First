const {OTP} = require('../controllers')
const express = require('express')
const Router = express.Router()
Router.get('/otp',OTP)
module.exports = Router