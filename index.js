const { log } = require('console');
let express = require('express');
require('dotenv').config()
let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const router = require('./routes/router')

app.use('/',router.router);

app.listen(process.env.PORT,() => {
    console.log("running");
})
