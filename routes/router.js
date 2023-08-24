const express = require('express')
const router = express.Router();
module.exports.router = router;

const check = require('./checkRouter');

router.use("/",check.checkRouter);