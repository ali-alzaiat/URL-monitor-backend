let express = require('express');
let user = require("../models/user")
let jwtUtil = require('../helpers/jwtUtil')
let app = express();

let users = new Map();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

module.exports.signUp = (req,res)=>{
    try {
        userName = req.body.userName;
        password = req.body.password;
        email = req.body.email;
        console.log(userName,password,email);
        if(!userName || !password || !email){
            res.status(500).send("user name, password and email can't be empty");
            return;
        }
        users.set(userName,new user.user(userName,password,email));
        return res.status(201).send("user added");
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
}

module.exports.signIn = (req,res)=>{
    try {
        userName = req.params.userName;
        password = req.params.password;
        console.log(userName,password);
        let signedUser = users.get(userName);
        if(!userName || !password){
            res.status(500).send("user name and password can't be empty")
            return;
        }
        if(!signedUser){
            res.status(401).send("user doesn't exist") 
            return;
        }
        if(password != signedUser.password){
            res.status(401).send("Wrong password")
            return;
        }
        let token = jwtUtil.generateToken(userName,signedUser.email);
        res.status(200).send(JSON.stringify(token));
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
}