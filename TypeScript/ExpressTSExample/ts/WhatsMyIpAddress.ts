const httpWMIPA = require('http');

function WhatsMyIpAddress(callback: any) {
    const options = {
        host: 'ipv4bot.whatismyipaddress.com',
        port: 80,
        path: '/'
    };

    httpWMIPA.get(options, (res: any) => {
        res.setEncoding('utf8');
        res.on("data", (chunk: any) => callback(chunk, null));
    }).on('error', (err: any) => callback(null, err.message));
}

module.exports = WhatsMyIpAddress;