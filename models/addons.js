const mongoose = require('mongoose')
const addOnsSchema = new mongoose.Schema({
                item : String,
                price : Number,
                image : String,
                merchantId : String,
},
{
                timestamps : true
})

const addOnsModel = mongoose.model("addOns",addOnsSchema)
module.exports = addOnsModel