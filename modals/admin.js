const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    accessToken :{
        type:String,
    },
    username:{
    type:String
    },
    email:{
        type:String
    },
    encryptedPassword:String,
    salt:String
})



require('./virtual')(adminSchema)



const adminModel = mongoose.model('Admin',adminSchema)
module.exports = adminModel