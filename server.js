const express = require('express')
// const config =  require("config");
require('dotenv').config()
const app = express() 
require('./app')(app)

app.listen(process.env.PORT || 9000,()=>{
    console.log(`listening on port ${process.env.PORT}`);
})