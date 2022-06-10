const mongoose = require('mongoose')
const config =  require('config');
var url = config.get("mongoDbConnectionUrl");

const connection = mongoose.connect(url,{ useNewUrlParser: true }).then(res=>{
    console.log(`successfully connected to ${url}`);
}).catch(err => {
    console.log(err);
    console.log(`cannot connect to the the ${url}`)
})

module.exports = connection