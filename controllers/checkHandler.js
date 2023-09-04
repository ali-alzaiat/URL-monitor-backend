let express = require('express');
let axios = require("axios");
let cache = require('../helpers/storage')
let checks = require('../models/checks')
let reports = require('../models/report')
const https = require('https');
let {users} = require("./loginHandler")
let {sendreq} = require("../helpers/sendreq")
let app = express();
let {checkMap} = require('../models/checks')
let {reportMap} = require('../models/report')
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
    res.responsetime = new Date().getTime() - res.config.metadata.startTime
    return res;
  }, function (error) {
    console.log(error)
    return Promise.reject(error);
});

module.exports.checkHandler = class checkHandler{
    
    constructor(){
        this.available= false;
    }

    async createCheck(req,res){
        try{
            //Get the user data
            let user = users.get(res.locals.user.userName)
            //make an instance of check class.
            let check = new checks.check();
            //make an instance of report class.
            let report = new reports.report();
            check.url = req.body.url;
            check.name = req.body.name;
            check.ignoreSSL = req.body.ignoreSSL;
            check.protocol = req.body.protocol;
            check.path = (req.body.path)?req.body.path:check.path;
            check.timeout = (req.body.timeout)?req.body.timeout:check.timeout;
            check.interval = (req.body.interval)?req.body.interval:check.interval;
            check.threshold = (req.body.threshold)?req.body.threshold:check.threshold;
            check.authentication = (req.body.authentication)?req.body.authentication:check.authentication;
            check.httpHeaders = (req.body.httpHeaders)?req.body.httpHeaders:check.httpHeaders;
            check.assert = (req.body.assert)?req.body.assert:check.assert;

            if(!check.url || !check.name || !check.ignoreSSL || !check.protocol){
                res.status(500).send("url, name, protocol and ignoreSSL shouldn't be empty");
                return;
            }
            //add the name of the check to the user checks
            user.checks.push(check.name);
            //Add the check and the report to the cache.
            cache.reportCache.set(check.name,report)
            cache.checkCache.set(check.name,check);
            //Add the check and the report to the Map.
            reportMap.set(check.name,report)
            checkMap.set(check.name,check);
            //set the total response time and the number of requests to 0.
            this.available= false;
            //send a request to the url.
            console.log(user);
            [this.available,check.url] = await sendreq(this.available,check)
            //make a polling request with intervals equal to 5 minutes.
            setInterval(async()=>{
                [this.available,check.url] = await sendreq(this.available,check)
            },check.interval*60*1000);
            console.log(cache.reportCache.get(check.name));
            res.send(reportMap.get(check.name))    
        }catch(e){
            console.log(e);
            res.status(500).send("Something went wrong");
        }
            
    }  
    
    async getCheck(req,res){
        try{
            let user = users.get(res.locals.user.userName);
            if(!user.checks.includes(req.params.name)){
                res.status(401).send("unauthorized access");
                return;
            }
            //Get check from cache
            let check = cache.checkCache.get(req.params.name);
            //if the check is not in the cache get it from the Map.
            if(check == undefined){
                check = checkMap.get(req.params.name);
            }
            //if check is not in the cache nor the Map then the check does not exist.
            if(check == undefined){
                res.status(404).send("Check does not exist");
                return;
            }
            res.send(check);
        }catch(e){
            console.log(e);
            res.status(500).sent("Something went wrong");
        }
    }

    async updateCheck(req,res){
        try{
            //Get check from cache
            let check = cache.checkCache.get(req.params.name);
            //if the check is not in the cache get it from the Map.
            if(check == undefined){
                check = checkMap.get(req.params.name);
            }
            //if check is not in the cache nor the Map then the check does not exist.
            if(check == undefined){
                res.status(404).send("Check does not exist");
                return;
            }
            check.name = req.body.name || check.name;
            check.url = req.body.url || check.url;
            check.protocol = req.body.url?.split(":")[0] || check.protocol;
            checkMap.delete(req.params.name);
            cache.checkCache.del(req.params.name);
            checkMap.set(check.name,check);
            cache.checkCache.set(check.name,check);
            res.send("updated");
        }catch(e){
            console.log(e);
            res.status(500).sent("Something went wrong");
        }
    }

    async deleteCheck(req,res){
        try{
            //Get check from cache
            let check = cache.checkCache.get(req.params.name);
            //if the check is not in the cache get it from the Map.
            if(check == undefined){
                check = checkMap.get(req.params.name);
            }
            //if check is not in the cache nor the Map then the check does not exist.
            if(check == undefined){
                res.send("Check does not exist");
                return;
            }
            checkMap.delete(req.params.name);
            cache.checkCache.del(req.params.name);
            res.send("Deleted");
        }catch(e){
            console.log(e);
            res.status(500).sent("Something went wrong");
        }
    }

    async getReport(req,res){
        try{
            //Get report from cache
            let report = cache.reportCache.get(req.params.name);
            //if the report is not in the cache get it from the Map.
            if(report == undefined){
                report = reportMap.get(req.params.name);
            }
            //if report is not in the cache nor the Map then the report does not exist.
            if(report == undefined){
                res.send("Report does not exist");
                return;
            }
            res.send(report);
        }catch(e){
            console.log(e);
            res.status(500).sent("Something went wrong");
        }
    }


}
