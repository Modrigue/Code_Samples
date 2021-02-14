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
        this.creator = false;
    }
}
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["NONE"] = 0] = "NONE";
    GameStatus[GameStatus["SETUP"] = 1] = "SETUP";
    GameStatus[GameStatus["PLAYING"] = 2] = "PLAYING";
})(GameStatus || (GameStatus = {}));
class Game_S {
    constructor() {
        this.nbPlayersMax = 2; // default
        this.players = new Map();
        this.status = GameStatus.NONE;
    }
}
let games = new Map();
let clientNo = 0;
io.on('connection', connected);
//////////////////////////////// RECEIVE EVENTS ///////////////////////////////
function connected(socket) {
    console.log(`Client '${socket.id}' connected`);
    sendRoomsList();
    const room = 1;
    //const nbPlayersReady = getNbPlayersReadyInRoom(room);
    // create new room
    socket.on('createNewRoom', (params, response) => {
        const room = params.room;
        console.log(`Client '${socket.id}' - '${params.name}' asks to create room '${room}'`);
        // check if room has already been created
        if (games.has(room)) {
            response({
                error: `Room '${room}' already exists. Please enter another room name.`
            });
            return;
        }
        // ok, create room
        let creator = new Player_S();
        creator.creator = true;
        creator.name = params.name;
        creator.room = room;
        let newGame = new Game_S();
        newGame.players.set(socket.id, creator);
        newGame.status = GameStatus.SETUP;
        games.set(room, newGame);
        socket.join(room);
        // send updated rooms list to all clients
        sendRoomsList();
        response({ room: room });
        updateNbPlayersMax(room, 2);
        sendPlayersList(room);
    });
    // join room
    socket.on('joinRoom', (params, response) => {
        var _a, _b;
        const room = params.room;
        // check if room exists
        if (!games.has(room)) {
            response({
                error: `Room '${room}' does not exist. Please try another room.`
            });
            return;
        }
        // check nb. of players left
        const nbPlayersCur = (_a = games.get(room)) === null || _a === void 0 ? void 0 : _a.players.size;
        const nbPlayersMax = (_b = games.get(room)) === null || _b === void 0 ? void 0 : _b.nbPlayersMax;
        if (nbPlayersCur >= nbPlayersMax) {
            response({
                error: `Room '${room}' is full. Please try another room.`
            });
            return;
        }
        // ok, create player and join room
        let player = new Player_S();
        player.name = params.name;
        player.room = room;
        let game = games.get(room);
        game.players.set(socket.id, player);
        // enable play button if game already on
        const enablePlay = (game.status == GameStatus.PLAYING);
        socket.join(room);
        updateNbPlayersMax(room, game.nbPlayersMax);
        sendPlayersList(room);
        response({ room: room, enablePlay: enablePlay });
    });
    // max. nb. of players update
    socket.on('setNbPlayersMax', (params, response) => {
        const room = getPlayerRoomFromId(socket.id);
        if (room.length == 0)
            return;
        // update on all room clients game setup page
        if (games.has(room)) {
            const game = games.get(room);
            if (game.status != GameStatus.PLAYING) {
                game.nbPlayersMax = params.nbPlayersMax;
                updateNbPlayersMax(room, params.nbPlayersMax);
            }
        }
    });
    // start play
    socket.on('play', (params, response) => {
        const room = getPlayerRoomFromId(socket.id);
        if (room.length == 0)
            return;
        if (games.has(room)) {
            const game = games.get(room);
            switch (game.status) {
                case GameStatus.SETUP:
                    // start new game
                    console.log(`Client '${socket.id}' starts game '${room}'`);
                    game.status = GameStatus.PLAYING;
                    playGame(room);
                case GameStatus.PLAYING:
                    // join started game
                    console.log(`Client '${socket.id}' joins started game '${room}'`);
                    playGame(room);
            }
        }
    });
    // disconnection
    socket.on('disconnect', function () {
        var _a;
        console.log(`Client '${socket.id}' disconnected`);
        // if creator player in setup page, kick all players in room and delete room
        let player = getPlayerFromId(socket.id);
        // if unregistered player, nop
        if (player.name.length == 0 || player.room.length == 0)
            return;
        if (!games.has(player.room))
            return;
        const room = player.room;
        // if creator at game setup, delete room and kick all players in room
        if (player.creator) {
            if (((_a = games.get(room)) === null || _a === void 0 ? void 0 : _a.status) == GameStatus.SETUP) {
                games.delete(room);
                console.log(`Creator '${player.name}' disconnected => Room '${room}' deleted`);
                sendRoomsList();
                kickAllPlayersFromRoom(room);
                return;
            }
        }
        // delete player in room
        const game = games.get(room);
        if (game.players !== null && game.players.has(socket.id))
            game.players.delete(socket.id);
        deleteEmptyRooms();
        sendRoomsList();
        sendPlayersList(room);
    });
    socket.on('kickPlayer', (params, response) => {
        let player = getPlayerFromId(params.id);
        const room = getPlayerRoomFromId(params.id);
        if (!games.has(room))
            return;
        // delete player in room
        const game = games.get(room);
        if (game.players !== null && game.players.has(params.id)) {
            game.players.delete(params.id);
            kickPlayerFromRoom(room, params.id);
        }
    });
}
////////////////////////////////// SEND EVENTS ////////////////////////////////
function sendRoomsList() {
    const rooms = Array.from(games.keys());
    io.emit('roomsList', rooms);
}
function sendPlayersList(room) {
    if (!games.has(room))
        return;
    const game = games.get(room);
    if (game.players === null)
        return;
    let playersData = new Array();
    for (const [id, player] of game.players)
        playersData.push({ id: id, name: player.name });
    io.to(room).emit('updatePlayersList', playersData);
}
function updateNbPlayersMax(room, nbPlayersMax) {
    io.to(room).emit('updateNbPlayersMax', { room: room, nbPlayersMax: nbPlayersMax });
}
function kickPlayerFromRoom(room, id) {
    io.to(room).emit('kickFromRoom', { room: room, id: id });
}
function kickAllPlayersFromRoom(room) {
    io.to(room).emit('kickFromRoom', { room: room, id: "" });
}
function playGame(room) {
    io.to(room).emit('playGame', { room: room });
}
////////////////////////////////////// HELPERS ////////////////////////////////
// delete empty rooms
function deleteEmptyRooms() {
    for (const [room, game] of games)
        if (game.players == null || game.players.size == 0)
            games.delete(room);
}
function getPlayerFromId(id) {
    for (const [room, game] of games)
        for (const [idCur, player] of game.players)
            if (idCur == id)
                return player;
    // not found, return empty player
    return new Player_S();
}
function getPlayerRoomFromId(id) {
    let player = getPlayerFromId(id);
    // if unregistered player, nop
    if (player.name.length == 0 || player.room.length == 0)
        return "";
    if (!games.has(player.room))
        return "";
    return player.room;
}
//# sourceMappingURL=server.js.map