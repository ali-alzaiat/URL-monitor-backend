const express = require('express')
const router = express.Router();
module.exports.router = router;

const check = require('./checkRouter');
const login = require("./loginRouter")

router.use("/",check.checkRouter);
router.use("/",(req,res)=>{login.loginRouter(req,res)});