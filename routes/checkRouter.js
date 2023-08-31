const express = require('express')
const checkRouter = express.Router();
module.exports.checkRouter = checkRouter;

const checkHandler = require('../controllers/checkHandler');
const {verify} = require("../middleware/authorization");
let check = new checkHandler.checkHandler();
console.log(check)

checkRouter.get("/:name",verify,(req,res)=>check.getCheck(req,res));
checkRouter.post("/",verify,(req,res)=>check.createCheck(req,res));
checkRouter.put("/:name",verify,(req,res)=>check.updateCheck(req,res));
checkRouter.delete("/:name",verify,(req,res)=>check.deleteCheck(req,res));
checkRouter.get("/report/:name",verify,(req,res)=>check.getReport(req,res));