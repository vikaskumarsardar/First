const express = require('express')
const Router = express.Router()
const {VerifyAdmin} = require('../middlewares')
const Admin = require('../controllers')
const Multer = require('../services/')

Router.post('/register',Admin.adminRegister)
Router.post('/login',Admin.adminLogin)
Router.post('/blockUnblock',VerifyAdmin,Admin.blockUnblock)
Router.post('/deleteUser',VerifyAdmin,Admin.deleteUser)
Router.post('/activateDeactivateUser',VerifyAdmin,Admin.activateDeactivateUser)
Router.post('/uploadOne',VerifyAdmin,Multer.UploadAdminSingle,Admin.UploadAdminOne)
Router.post('/uploadMany',VerifyAdmin,Multer.UploadAdminMany,Admin.UploadAdminMany)
Router.post('/uploadFields',VerifyAdmin,Multer.UploadAdminFields,Admin.UploadAdminFields)

module.exports = Router