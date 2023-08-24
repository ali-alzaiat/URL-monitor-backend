let express = require('express');
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

module.exports.checkHandler = class checkHandler{
    
    constructor(){
        this.time = 0;
        this.n = 0;
        this.available= false;
        this.url;
    }

    async createCheck(req,res){
        console.log(this)
        this.url = req.body.url;
        this.time = 0;
        this.n = 0;
        this.available= false;
        [this.available,this.url,this.n,this.time] = await sendreq(this.available,this.url,this.n,this.time)
        setInterval(async()=>{
            // req.url
            [this.available,this.url,this.n,this.time] = await sendreq(this.available,this.url,this.n,this.time)
        },300000);
        res.send(this.available)
            
    }  
    
    async getCheck(req,res){
        if(this.url != req.body.url){
            res.write("Doesn't exist");
            res.end();
        }
        else{
            res.write(JSON.stringify({'available':this.available,"Response time":this.time/this.n, "uptime":this.n}));
            res.end();
        }
    }
}

async function sendreq(available,url,n,time){
    try{
        if(!(url)) return;
        res = axios.get(url);
        response = await res;
        if(n == Number.MAX_SAFE_INTEGER){
            n = 0;
            time = 0;
        }
        if(response.status === 200 || response.status === 301 || response.status === 302) {
            console.log('available');
            available= true;
            console.log(available);
            time += response.responsetime;
            n++;
            console.log(time/n);
        } else {
            console.log('unavailable');
            available= false;
        }
        console.log(url)
        return [available,url,n,time];
    }catch(e){
        console.log(e);
        available= false;
        return [available,url,n,time];
    }
}