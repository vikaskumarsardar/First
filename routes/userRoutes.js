const express = require('express')
const Router = express.Router()
const User = require('../controllers') 
const Multer = require('../services/')
const {VerifyUser} = require('../middlewares/')

Router.post('/register',User.userRegister)
Router.post('/login',User.userLogin)
// Router.post('/blockUnblock',blockUnblock)
Router.post('/activateDeactivate',VerifyUser,User.activateDeactivate)
Router.post('/uploadOne',VerifyUser,Multer.UploadUserSingle,User.UploadUserOne)
Router.post('/uploadMany',VerifyUser,Multer.UploadUserMany,User.UploadUserMany)
Router.post('/uploadFields',VerifyUser,Multer.UploadUserFields,User.UploadUserFields)
Router.post('/verify',User.VerifyUser)

Router.get('/signup',User.UserSignup)
Router.get('/login',User.UserLogin)
Router.get('/verify',User.OTP)


module.exports = Router