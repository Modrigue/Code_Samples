"use strict";
const DEPLOY_CLIENT = true;
let socket;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);
class Player {
    constructor() {
        this.score = 0;
        this.no = 0;
        this.name = "";
        this.room = "";
        this.color = "";
    }
}
// init game
let clientBalls = new Map();
let selfID;
let room = -1;
let nbPlayersReadyInRoom = 0;
/////////////////////////// INTERACTION WITH SERVER ///////////////////////////
socket.on('connect', () => {
    selfID = socket.id;
});
/*form.onsubmit = function(e)
{
    e.preventDefault();

    const name = (<HTMLInputElement>document.getElementById('userName')).value;
    const roomCandidate = 1; //document.getElementById('userRoom').value;

    socket.emit('clientName', {name: name, room: roomCandidate}, (response: any) => {
        
        if (response.error)
        {
            alert(response.error);
            return true;
        }
        else
        {
            // ok, enter room
            room = roomCandidate;
            form.style.display = 'none';
            gameAreaDiv.style.display = 'block';
            document.body.style.backgroundColor = "Black";
            canvas.focus();
            
            return false;
        }
      });
}*/ 
//# sourceMappingURL=client.js.map