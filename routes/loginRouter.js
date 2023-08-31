const express = require('express')
const loginRouter = express.Router();
module.exports.loginRouter = loginRouter;

let {signIn,signUp} = require("../controllers/loginHandler")

loginRouter.post("/signUp",signUp);
loginRouter.get("/signIn/:userName/:password",signIn);