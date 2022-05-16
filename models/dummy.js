const mongoose = require('mongoose')

const dummySchema = new mongoose.Schema({
    itemName :{
        type:String,
        default:""
    },
    details:{
    type:String,
    default: ""
    },
},
{
timestamps : true
})

const dummyModel = mongoose.model('Dummy',dummySchema)
module.exports = dummyModel