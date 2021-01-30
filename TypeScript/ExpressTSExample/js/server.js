"use strict";
let app = require('express')();
let bodyParser = require('body-parser');
const path = require('path');
let session = require('express-session');
// parameters
const DEPLOY = true;
let hostname = "127.0.0.1";
let port = 5500;
// expose on public IP (don't forget to open the port)
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
////////////////////////////////// MIDDLEWARES ////////////////////////////////
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } /* http */
}));
//////////////////////////////////// ROUTES ///////////////////////////////////
app.get('/', (request, response) => {
    const GetCurrentDateTime = require('../js/datetime');
    console.log(`${GetCurrentDateTime()}: Someone connected on ${request.url}`);
    if (request.session.error) {
        response.locals.error = request.session.error;
        request.session.error = undefined;
    }
    response.sendFile(path.join(__dirname, '../index.html'));
    //__dirname : It will resolve to your project folder.
    //response.render('./index');
    //response.send('Salut Test Express');
});
app.post('/', (request, response) => {
    const word = request.body.word1;
    console.log(`New word: ${word} from ${request.connection.remoteAddress}`);
    if (word === undefined || word === '') {
        request.session.error = "There is an error";
        response.sendFile(path.join(__dirname, '../index.html'));
    }
    response.sendFile(path.join(__dirname, '../index.html'));
});
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
//# sourceMappingURL=server.js.map