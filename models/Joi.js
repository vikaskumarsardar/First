const joi = require('joi')

const Schema = joi.object({
                username : joi.string().alphanum().min(3).max(30).required(),
                password : joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,10}$')).required(),
                firstname : joi.string().min(3).max(10),
                lastname : joi.string().min(3).max(10),
                email : joi.string().email({
                                minDomainSegments : 2, tlds : { allow : ['com','net','org']}
                }),
                phone : joi.string().min(10).max(10),
                countryCode : joi.string().min(3).max(6),

}).with('phone','countryCode')

try{

                const {error,value} = Schema.validate({
                                username : "swapank umarsardar",
                                password : "1234",
                                firstname : "swapan",
                                lastname : "sardar",
                                email : "swapankumarsardar73727@gmail.com",
                                phone : "8084226216",
                                countryCode : "+91"
                                
                })
                
                if(!error) console.log(value);
                else console.log(error.details[0].message);

}catch(err){
                console.log(err,"kast ");
}
