const https = require('https');
let axios = require("axios");
let {checkMap} = require('../models/checks')
let {reportMap} = require('../models/report')
let {reportCache} = require("./storage")


exports.sendreq = async function sendreq(available,check){
    try{
        let time = 0;
        //If the url is undefined return.
        if(!(check.url)) return;
        //set the ignoreSSL flag.
        let ignoreSSL = (check.ignoreSSL.toLowerCase() == 'true')?true:false;
        const httpsAgent = new https.Agent({ rejectUnauthorized: !ignoreSSL });
        //if the protocal is written with the url, discard it.
        let url = check.protocol+"://"+check.url.replace(/\w+:\/\//, '')+check.path;
        //set the credentials in the header.
        const credentials = Buffer.from(`${check.authentication?.username}:${check.authentication?.password}`).toString('base64') 
        let header = {...{ httpsAgent },...JSON.parse(check.httpHeaders),Authorization: `Basic ${credentials}`}
        //send a GET request to the url.
        let res = axios.request({
            timeout: parseFloat(check.timeout)*1000,
            method: "GET",
            url: url
        },header);
        //get the report of the check.
        let report = reportCache.get(check.name);
        if(report == undefined){
            report = reportMap.get(check.name);
        }
        //get the total number of request sent.
        let n = (report.history?.length+1)||1;
        console.log(n)
        console.log(report.history?.length)
        let response = await res;
        if(response.status === (check.assert || 200)) {
            console.log('available');
            available= true;
            console.log(available);
            time = (report.responseTime*(report.history?.length)) + response.responsetime;
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
            report.uptime = (report.history?.length !== 0)?report.uptime+(check.interval*60):1;
        }else{
            report.downtime = (report.history?.length !== 0)?report.downtime+(check.interval*60):1;
        }
        report.availability = (report.uptime/(report.uptime+report.downtime))*100;
        report.history.push({time:new Date(), request:(report.history?.length||0)+1});
        reportCache.set(check.name,report)
        reportMap.set(check.name,report)
        return [available,check.url];
    }catch(e){
        console.log(e);
        available= false;
        throw new Error(e);
    }
}