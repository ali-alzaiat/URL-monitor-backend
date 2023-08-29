module.exports.check = class check{
    name;       //The name of the check.
    url;        //The URL to be monitored.
    protocol;   //The resource protocol name HTTP, HTTPS, or TCP.
    ignoreSSL;  //A flag to ignore broken/expired SSL certificates in case of using the HTTPS protocol.
}