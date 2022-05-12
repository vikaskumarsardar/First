const mongoose = require('mongoose')
const schema = mongoose.Schema({
    username : String,
    phone : Number,
    

},{
    timestamps : true
})


const phoneModel = mongoose.model('Phone',schema)
module.exports = phoneModel