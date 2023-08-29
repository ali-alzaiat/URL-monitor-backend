const express = require('express')
const checkRouter = express.Router();
module.exports.checkRouter = checkRouter;

const checkHandler = require('../controllers/checkHandler');
let check = new checkHandler.checkHandler();
console.log(check)

checkRouter.get("/:name",(req,res)=>check.getCheck(req,res));
checkRouter.post("/",(req,res)=>check.createCheck(req,res));
checkRouter.put("/:name",(req,res)=>check.updateCheck(req,res));