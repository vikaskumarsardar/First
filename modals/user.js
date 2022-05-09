const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    firstname:{
        type:String},
    lastname:{
    type:String,
    },
    username:{
        type:String,
        unique:true
    },    
    isDeleted:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    accessToken:{
        type:String,
    }
},{
    timestamps:true
})


require('./virtual')(userSchema)

const userModel = mongoose.model("Users",userSchema)
module.exports = userModel