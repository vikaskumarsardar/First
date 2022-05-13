const express = require('express')
const path = require('path')
module.exports = (app) =>{
    // app.use(express.urlencoded({extended:true}))
    const views = path.join(__dirname,"views")
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    app.set('view engine','ejs')
    app.set('views',views)
    app.use('/css',express.static(path.join(__dirname,'/public/css')))
    app.use('/static/users',express.static(path.resolve('uploads/users')))
    app.use('/static/admin',express.static(path.join(__dirname,'uploads/admin')))
    require('./config/').connection
    app.use('/api',require('./routes'))
}