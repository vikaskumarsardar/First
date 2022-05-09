const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URL).then(res=>{
    console.log('successfully connected');
}).catch(err=>{
    console.log(`cannot connect to the the ${url} `)
})