const mongoose = require('mongoose')
const config = require('./config')

const connection = mongoose.connect(config.ATLAS_URL,{ useNewUrlParser: true }).then(res=>{
    console.log(`successfully connected to ${config.ATLAS_URL}`);
}).catch(err => {
    console.log(err);
    console.log(`cannot connect to the the ${config.ATLAS_URL} `)
})

module.exports = connection