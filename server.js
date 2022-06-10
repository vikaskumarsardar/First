const express = require('express')
const config =  require("config");
const app = express() 
require('./app')(app)

app.listen(config.get("port"),()=>{
    console.log(`listening on port ${config.get("port")}`);
})