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


//////////////////////////////// WELCOME PAGE ////////////////////////////////


function onSubmit()
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
                    setVisible("pageGame", false);

                    setEnabled("gameNbPlayers", false);
                    setEnabled("buttonPlay", response.enablePlay);
                    (<HTMLButtonElement>document.getElementById('buttonPlay')).innerText
                        = response.enablePlay ? "JOIN GAME" : "START GAME";
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
                    setVisible("pageGame", false);

                    setEnabled("gameNbPlayers", true);
                    setEnabled("buttonPlay", true);
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


/////////////////////////////// GAME SETUP PAGE ///////////////////////////////


socket.on('kickFromRoom', (params: any) => {  
    // return to welcome page
    (<HTMLParagraphElement>document.getElementById('gameSetupTitle')).innerText = `Welcome`;
    (<HTMLSelectElement>document.getElementById('joinRoomName')).selectedIndex = -1;
    setVisible("pageWelcome", true);
    setVisible("pageGameSetup", false);
});

function onNumberInput(): void
{
    // limit nb. of characters to max length
    if (this.value.length > this.maxLength)
        this.value = this.value.slice(0, this.maxLength);

    // update max. nb. players in room
    const selectNbPlayers = <HTMLInputElement>document.getElementById('gameNbPlayers');
    if (!selectNbPlayers.disabled)
    {
        const nbPlayersMax = <number>parseInt(selectNbPlayers.value);
        socket.emit('setNbPlayersMax', {nbPlayersMax: nbPlayersMax}, (response: any) => {});
    }
}

socket.on('updateNbPlayersMax', (params: any) => {

    const selectNbPlayers = <HTMLInputElement>document.getElementById('gameNbPlayers');
    if (!selectNbPlayers.disabled)
        return; // creator, nop

    selectNbPlayers.value = params.nbPlayersMax.toString();
});

function onPlay()
{
    socket.emit('play', null, (response: any) => {});
}

socket.on('playGame', (params: any) => {

    (<HTMLParagraphElement>document.getElementById('gameTitle')).innerText
        = `Game ${params.room}`;

    setVisible("pageWelcome", false);
    setVisible("pageGameSetup", false);
    setVisible("pageGame", true);
});