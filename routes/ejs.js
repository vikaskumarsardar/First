const {OTP,home} = require('../controllers')
const express = require('express')
const Router = express.Router()
Router.get('/otp',OTP)
Router.get('/',home)

module.exports = Router