const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 9000 

require('./app')(app)

app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})