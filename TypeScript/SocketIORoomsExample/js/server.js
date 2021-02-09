"use strict";
const DEPLOY = true;
const PORT = DEPLOY ? (process.env.PORT || 13000) : 5500;
const express = require('express');
const app = express();
let io;
if (DEPLOY) {
    app.use(express.static('.'));
    const http = require('http').Server(app);
    io = require('socket.io')(http);
    app.get('/', (req, res) => res.sendFile(__dirname + '../index.html'));
    http.listen(PORT, function () {
        console.log(`listening on port ${PORT}...`);
    });
}
else {
    io = require('socket.io')(PORT);
    app.get('/', (req, res) => res.send('Hello World!'));
}
class Player_S {
    constructor() {
        this.score = 0;
        this.no = 0;
        this.name = "";
        this.room = "";
        this.color = "";
    }
}
let serverBalls = new Map();
let clientNo = 0;
io.on('connection', connected);
function connected(socket) {
    console.log(`Client '${socket.id}' connected`);
    const room = 1;
    //const nbPlayersReady = getNbPlayersReadyInRoom(room);
    // disconnection
    socket.on('disconnect', function () {
        console.log(`Client '${socket.id}' disconnected`);
    });
}
//# sourceMappingURL=server.js.map