const { log } = require('console');
let express = require('express');
let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const router = require('./routes/router')

app.use('/',router.router);

app.listen(3000,() => {
    console.log("running");
})
