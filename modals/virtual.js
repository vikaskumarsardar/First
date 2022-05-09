const crypto = require('crypto')
const {v1:uuidv1} = require('uuid')

module.exports = (Schema) =>{

    Schema.virtual('password').set(function(password){
        this.salt = uuidv1()
        this.encryptedPassword = this.securePassword(password)
    })
    

    Schema.methods = {
        
        isValid:function(plainPassword){
            return this.encryptedPassword === this.securePassword(plainPassword)
        },
        securePassword:function(plainPassword){
            return crypto.createHmac('sha256',this.salt).update(plainPassword).digest('hex') 
        }
    }


    Schema.methods = {

        isValid:function(plainPassword){
            return this.encryptedPassword === this.securePassword(plainPassword)
        },
        securePassword:function(plainPassword){
            return crypto.createHmac('sha256',this.salt).update(plainPassword).digest('hex') 
        }
    }
}