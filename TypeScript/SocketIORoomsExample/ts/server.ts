const DEPLOY = true;
const PORT = DEPLOY ? (process.env.PORT || 13000) : 5500;

const express = require('express')
const app = express()
let io: any;


if (DEPLOY)
{
    app.use(express.static('.'));
    const http = require('http').Server(app);
    io = require('socket.io')(http);
    
    app.get('/', (req: any, res: any) => res.sendFile(__dirname + '../index.html'));
    
    http.listen(PORT, function(){
        console.log(`listening on port ${PORT}...`);
    })
}
else
{
    io = require('socket.io')(PORT)
    app.get('/', (req: any, res: any) => res.send('Hello World!'))
}

class Player_S
{
    score: number = 0;
    no: number = 0;
    name: string = "";

    room: string = "";
    color: string = "";
}

let serverBalls: Map<string, Player_S> = new Map<string, Player_S>();
let clientNo: number = 0;

io.on('connection', connected);

function connected(socket: any)
{
    console.log(`Client '${socket.id}' connected`);

    const room = 1;
    //const nbPlayersReady = getNbPlayersReadyInRoom(room);
    

    // disconnection
    socket.on('disconnect', function()
    {
        console.log(`Client '${socket.id}' disconnected`);
    });

}