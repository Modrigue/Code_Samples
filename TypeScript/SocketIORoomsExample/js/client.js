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
function onButtonClick() {
    const userName = document.getElementById('userName').value;
    if (userName === null || userName.length == 0) {
        alert('Please enter your name');
        return;
    }
    const room = getSelectedRoomName();
    if (room === null || room.length == 0) {
        alert('Please enter a name for the room');
        return;
    }
    const mode = getSelectedRoomMode();
    switch (mode) {
        case 'join':
            socket.emit('joinRoom', { name: userName, room: room }, (response) => {
                if (response.error) {
                    alert(response.error);
                    document.getElementById('joinRoomName').selectedIndex = -1;
                    return;
                }
                else if (response.room) {
                    // ok, go to game setup page
                    document.getElementById('gameSetupTitle').innerText
                        = `Game ${response.room} setup`;
                    setVisible("pageWelcome", false);
                    setVisible("pageGameSetup", true);
                }
            });
            break;
        case 'create':
            socket.emit('createNewRoom', { name: userName, room: room }, (response) => {
                if (response.error) {
                    alert(response.error);
                    return;
                }
                else if (response.room) {
                    // ok, go to game setup page in creator mode
                    document.getElementById('gameSetupTitle').innerText
                        = `Game ${response.room} setup`;
                    setVisible("pageWelcome", false);
                    setVisible("pageGameSetup", true);
                    setEnabled("gameNbPlayers", true);
                }
            });
            break;
    }
}
socket.on('roomsList', (params) => {
    let rooms = Array.from(params);
    rooms = rooms.sort((a, b) => a.localeCompare(b)); // sort alphabetically
    // update room selector
    const roomSelect = document.getElementById("joinRoomName");
    while (roomSelect.options.length > 0)
        roomSelect.remove(0);
    for (const room of rooms) {
        let option = document.createElement('option');
        option.value = room;
        option.innerText = room;
        roomSelect.appendChild(option);
    }
    roomSelect.selectedIndex = -1;
});
socket.on('kickFromRoom', (params) => {
    // return to welcome page
    document.getElementById('gameSetupTitle').innerText = `Welcome`;
    document.getElementById('joinRoomName').selectedIndex = -1;
    setVisible("pageWelcome", true);
    setVisible("pageGameSetup", false);
});
//# sourceMappingURL=client.js.map