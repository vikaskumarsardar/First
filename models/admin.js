const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    accessToken :{
        type:String,
        default:""
    },
    username:{
    type:String,
    default: ""
    },
    image:Array,
    isAdmin:{
        type:Boolean,
        default:true
    },
    email:{
        type:String,
        default:""
    },
    encryptedPassword:String,
    salt:String,
    phone:Number,
    isPhoneVerified : {
        type:Boolean,
        default : false
    },
    isEmailVerified : {
        type:Boolean,
        default : false
    },
    merchantId : [
        {
            type : mongoose.Types.ObjectId,
            ref : "Merchant"
        }
    ]
    
},{
    timestamps:true
})



require('./virtual')(adminSchema)



const adminModel = mongoose.model('Admin',adminSchema)
module.exports = adminModel