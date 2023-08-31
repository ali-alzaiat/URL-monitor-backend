var jwt = require('jsonwebtoken');
require('dotenv').config()

exports.generateToken = (userName,email)=>{
    var token = jwt.sign({ userName: userName, email:email }, process.env.SECRET_KEY, {expiresIn:"3h"});
    return token;
}
exports.verifyToken = (token)=>{
    return jwt.verify(token,process.env.SECRET_KEY);
}