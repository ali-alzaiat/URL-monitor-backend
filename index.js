const { log } = require('console');
let express = require('express');
let fs = require('fs');
let axios = require("axios");
let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

axios.interceptors.request.use(res => {
    res.metadata = { startTime: new Date().getTime()}
    return res;
}, function (error) {
    console.log(error)
    return Promise.reject(error);
})

axios.interceptors.response.use((res) => {
    // res.config.metadata.endTime = new Date()
    res.responsetime = new Date().getTime() - res.config.metadata.startTime
    return res;
  }, function (error) {
    console.log(error)
    return Promise.reject(error);
});

let time = 0;
let n = 0;
let available= false;
let url;
setInterval(()=>{
    // req.url
    if(!(url)) return;
    axios.get(url).then((response)=>{
        // console.log(res);
        if(n == Number.MAX_SAFE_INTEGER){
            n = 0;
            time = 0;
        }
        if(response.status === 200 || response.status === 301 || response.status === 302) {
            console.log('available');
            available= true;
            time += response.responsetime;
            n++;
            console.log(time/n);
        } else {
            console.log('unavailable');
            available= false;
        }
    }).catch(e=>{
        console.log(e);
        available= false;
    });
},1000)

app.get('/',(req,res) => {
    if(url != req.body.url){
        url = req.body.url;
        setTimeout(()=>{
            res.write(JSON.stringify({'available':available,"Response time":time/n}));
            res.end();
        },5000);
    }
    else{
        res.write(JSON.stringify({'available':available,"Response time":time/n}));
        res.end();
    }
})

app.listen(3000,() => {
    console.log("running");
})
