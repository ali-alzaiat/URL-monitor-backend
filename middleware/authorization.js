const express = require('express');
const jwtUtil = require('../helpers/jwtUtil')
const app = express();

exports.verify = (req,res,next)=>{
    try {
        const data = jwtUtil.verifyToken(req.body.token);
        res.locals.user = data;
        next();
    } catch (error) {
        res.status(401).send("login first");
    }
}