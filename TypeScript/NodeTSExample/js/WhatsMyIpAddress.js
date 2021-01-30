"use strict";
const httpWMIPA = require('http');
function WhatsMyIpAddress(callback) {
    const options = {
        host: 'ipv4bot.whatismyipaddress.com',
        port: 80,
        path: '/'
    };
    httpWMIPA.get(options, (res) => {
        res.setEncoding('utf8');
        res.on("data", (chunk) => callback(chunk, null));
    }).on('error', (err) => callback(null, err.message));
}
module.exports = WhatsMyIpAddress;
//# sourceMappingURL=WhatsMyIpAddress.js.map