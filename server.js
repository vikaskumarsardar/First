const express = require('express')
require('dotenv').config()
const app = express() 
const port = process.env.PORT || 9000
require('./app')(app)

app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})