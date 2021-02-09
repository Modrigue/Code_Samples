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
        this.isCreator = false;
    }
}
class Game_S {
    constructor() {
        this.nbPlayers = 0;
        this.players = new Map();
    }
}
let games = new Map();
let clientNo = 0;
io.on('connection', connected);
function connected(socket) {
    console.log(`Client '${socket.id}' connected`);
    const room = 1;
    //const nbPlayersReady = getNbPlayersReadyInRoom(room);
    socket.on('createNewRoom', (params, response) => {
        console.log(`Client '${socket.id}' - '${params.name}' asks to create room '${params.room}'`);
        // check if room has already been created
        if (games.has(params.room)) {
            response({
                error: `Room '${params.room} already exists. Please enter another room name.'`
            });
            return;
        }
        // ok, create room
        let creator = new Player_S();
        creator.isCreator = true;
        let newGame = new Game_S();
        newGame.players.set(socket.id, creator);
        games.set(params.room, newGame);
        // send updated rooms list to all clients
        sendRoomsList();
    });
    // disconnection
    socket.on('disconnect', function () {
        console.log(`Client '${socket.id}' disconnected`);
    });
}
function sendRoomsList() {
    const rooms = Array.from(games.keys());
    io.emit('roomsList', rooms);
}
//# sourceMappingURL=server.js.map