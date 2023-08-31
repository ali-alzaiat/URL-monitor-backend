module.exports.check = class check{
    name;           //The name of the check.
    url;            //The URL to be monitored.
    protocol;       //The resource protocol name HTTP, HTTPS, or TCP.
    ignoreSSL;      //A flag to ignore broken/expired SSL certificates in case of using the HTTPS protocol.
    path = '';      //A specific path to be monitored (optional).
    timeout = 5;    //(defaults to 5 seconds): The timeout of the polling request (optional).
    interval = 10;  //(defaults to 10 minutes): The time interval for polling requests (optional).
    threshold = 1;  //(defaults to 1 failure): The threshold of failed requests that will create an alert (optional).
    authentication; //An HTTP authentication header, with the Basic scheme, to be sent with the polling request (optional).
    httpHeaders;    //A list of key/value pairs custom HTTP headers to be sent with the polling request (optional).
    assert;         //The response assertion to be used on the polling response (optional).
    tags = [];      //A list of the check tags (optional).
}