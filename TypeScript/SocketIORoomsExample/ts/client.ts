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


function onButtonClick()
{
    const userName = (<HTMLInputElement>document.getElementById('userName')).value;
    if (userName === null || userName.length == 0)
    {
        alert('Please enter your name');
        return;
    }

    const room = getSelectedRoomName();
    if (room === null || room.length == 0)
    {
        alert('Please enter a name for the room');
        return;
    }

    const mode: string = getSelectedRoomMode();
    switch (mode)
    {
        case 'join':
            socket.emit('joinRoom', {name: userName, room: room}, (response: any) => {
        
                if (response.error)
                {
                    alert(response.error);
                    (<HTMLSelectElement>document.getElementById('joinRoomName')).selectedIndex = -1;
                    return;
                }
                else if (response.room)
                {
                    // ok, go to game setup page
                    (<HTMLParagraphElement>document.getElementById('gameSetupTitle')).innerText
                        = `Game ${response.room} setup`;

                    setVisible("pageWelcome", false);
                    setVisible("pageGameSetup", true);
                }
            });
            break;
    
        case 'create':
            socket.emit('createNewRoom', {name: userName, room: room}, (response: any) => {
        
                if (response.error)
                {
                    alert(response.error);
                    return;
                }
                else if (response.room)
                {
                    // ok, go to game setup page in creator mode
                    (<HTMLParagraphElement>document.getElementById('gameSetupTitle')).innerText
                        = `Game ${response.room} setup`;

                    setVisible("pageWelcome", false);
                    setVisible("pageGameSetup", true);

                    setEnabled("gameNbPlayers", true);
                }
            });
            break;
    } 
}

socket.on('roomsList', (params: any) =>
{
    let rooms: Array<string> = Array.from(params);
    rooms = rooms.sort((a, b) => a.localeCompare(b)); // sort alphabetically
    
    // update room selector

    const roomSelect = <HTMLSelectElement>document.getElementById("joinRoomName");

    while (roomSelect.options.length > 0)         
        roomSelect.remove(0);

    for (const room of rooms)
    {        
        let option = document.createElement('option');
        option.value = room;
        option.innerText = room;
        roomSelect.appendChild(option);    
    }

    roomSelect.selectedIndex = -1;
});

socket.on('kickFromRoom', (params: any) => {  
    // return to welcome page
    (<HTMLParagraphElement>document.getElementById('gameSetupTitle')).innerText = `Welcome`;
    (<HTMLSelectElement>document.getElementById('joinRoomName')).selectedIndex = -1;
    setVisible("pageWelcome", true);
    setVisible("pageGameSetup", false);
});