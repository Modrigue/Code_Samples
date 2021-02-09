const DEPLOY_CLIENT: boolean = true;

let socket: any;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);

class Player
{
    score: number = 0;
    no: number = 0;
    name: string = "";

    room: string = "";
    color: string = "";
}

// init game
let clientBalls: Map<string, Player> = new Map<string, Player>();
let selfID: string;
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