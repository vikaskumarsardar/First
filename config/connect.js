const mongoose = require('mongoose')
const config = require('./config')

const connection = mongoose.connect(config.MONGO_URL,{ useNewUrlParser: true }).then(res=>{
    console.log(`successfully connected to ${config.MONGO_URL}`);
}).catch(err => {
    console.log(err);
    console.log(`cannot connect to the the ${config.MONGO_URL} `)
})

module.exports = connection