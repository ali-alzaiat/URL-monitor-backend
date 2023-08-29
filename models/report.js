module.exports.report = class report{
    status = "";         //The current status of the URL.
    availability = 0;   //A percentage of the URL availability.
    outages = 0;        //The total number of URL downtimes.
    downtime = 0;       //The total time, in seconds, of the URL downtime.
    uptime = 0;         //The total time, in seconds, of the URL uptime.
    responseTime = 0;   //The average response time for the URL.
    history = [];        //Timestamped logs of the polling requests.
}