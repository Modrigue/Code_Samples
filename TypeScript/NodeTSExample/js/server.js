"use strict";
console.log("Server initialization...");
const http = require('http');
let fs = require('fs');
let url = require('url');
// server parameters
const DEPLOY = true;
// localhost
let hostname = '127.0.0.1';
let port = 5500;
// expose on public IP (don't forget to open the port)
if (DEPLOY) {
    port = 13000;
    // get public IP address
    hostname = '0.0.0.0';
    const WhatsMyIpAddress = require('../js/WhatsMyIpAddress');
    WhatsMyIpAddress((data, err) => {
        if (err == null) {
            hostname = data;
            console.log(`Public IP address: http://${hostname}:${port}`);
        }
    });
}
const server = http.createServer((request, response) => {
    const GetCurrentDateTime = require('../js/datetime');
    //console.log(`Request received at http://${hostname}:${port}${request.url}`);    
    console.log(`${GetCurrentDateTime()}: Someone connected on ${request.url}`);
    // response with HTML index page
    const indexPath = "./index.html";
    fs.readFile(indexPath, 'utf-8', (err, data) => {
        if (err) {
            response.writeHead(404);
            response.end(`Le fichier ${indexPath} n'existe pas`);
        }
        else {
            response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            const query = url.parse(request.url, true).query;
            const nameValue = (query["name"] === undefined) ? "Anonyme" : query["name"];
            data = data.replace("{{ name }}", nameValue);
            //res.write(data); res.end(); // equivalent
            response.end(data);
        }
    });
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
//# sourceMappingURL=server.js.map