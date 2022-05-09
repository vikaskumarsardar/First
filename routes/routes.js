const express = require('express')
const Router = express.Router()
const {userRegister,adminRegister} = require('../controllers')

Router.post('/register',userRegister)
Router.post('/registerAdmin',adminRegister)


module.exports = Router