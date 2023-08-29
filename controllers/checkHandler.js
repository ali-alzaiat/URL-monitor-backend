let express = require('express');
let axios = require("axios");
let cache = require('../helpers/storage')
let checks = require('../models/checks')
let reports = require('../models/report')
let app = express();
let checkMap = new Map();
let reportMap = new Map();
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
        // console.log(check)
        try{
            let check = new checks.check();
            let report = new reports.report();
            check.url = req.body.url;
            check.name = req.body.name;
            check.protocol = req.body.url.split(":")[0];
            cache.reportCache.set(check.name,report)
            cache.checkCache.set(check.name,check);
            reportMap.set(check.name,report)
            checkMap.set(check.name,check);
            // console.log(cache.checkCache)
            this.time = 0;
            this.n = 0;
            this.available= false;
            [this.available,check.url,this.n,this.time] = await sendreq(this.available,check,this.n,this.time)
            setInterval(async()=>{
                // req.url
                [this.available,check.url,this.n,this.time] = await sendreq(this.available,check,this.n,this.time)
            },300000);
            console.log(cache.reportCache.get(check.name));
            res.send(reportMap.get(check.name))    
        }catch(e){
            console.log(e);
            res.status(500).send("Something went wrong");
        }
            
    }  
    
    async getCheck(req,res){
        try{
            let check = cache.checkCache.get(req.params.name);
            if(check == undefined){
                check = checkMap.get(req.params.name);
            }
            if(check == undefined){
                res.send("Check does not exist");
                return;
            }
            res.send(check);
        }catch(e){
            console.log(e);
            res.status(500).sent("Something went wrong");
        }
    }
}

async function sendreq(available,check,n,time){
    try{
        if(!(check.url)) return;
        res = axios.get(check.url);
        let report = cache.reportCache.get(check.name);
        if(report == undefined){
            report = reportMap.get(check.name);
        }
        // console.log(cache.reportCache.get(check.name))
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
        console.log(check.url)
        if(report.status == 'available' && !available){
            report.outages = report.outages+1;
        }
        report.status = available?'available':'unavailable';
        report.responseTime = available?time/n:0;
        if(available){
            report.uptime = report.uptime+1;
        }else{
            report.downtime = report.downtime+1;
        }
        console.log((report.uptime+report.downtime));
        report.availability = (report.uptime/(report.uptime+report.downtime))*100;
        cache.reportCache.set(check.name,report)
        reportMap.set(check.name,report)
        return [available,check.url,n,time];
    }catch(e){
        console.log(e);
        available= false;
        throw new Error(e);
        return [available,check.url,n,time];
    }
}