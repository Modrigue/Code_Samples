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
//////////////////////////////// WELCOME PAGE ////////////////////////////////
function onSubmit() {
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
                    setVisible("pageGame", false);
                    setEnabled("gameNbPlayers", false);
                    setEnabled("buttonPlay", response.enablePlay);
                    document.getElementById('buttonPlay').innerText
                        = response.enablePlay ? "JOIN GAME" : "START GAME";
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
                    setVisible("pageGame", false);
                    setEnabled("gameNbPlayers", true);
                    setEnabled("buttonPlay", true);
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
/////////////////////////////// GAME SETUP PAGE ///////////////////////////////
socket.on('kickFromRoom', (params) => {
    if (params.id.length == 0 /* all */ || params.id == selfID) {
        // return to welcome page
        document.getElementById('gameSetupTitle').innerText = `Welcome`;
        document.getElementById('joinRoomName').selectedIndex = -1;
        setVisible("pageWelcome", true);
        setVisible("pageGameSetup", false);
    }
});
function onNumberInput() {
    // limit nb. of characters to max length
    if (this.value.length > this.maxLength)
        this.value = this.value.slice(0, this.maxLength);
    // update max. nb. players in room
    const selectNbPlayers = document.getElementById('gameNbPlayers');
    if (!selectNbPlayers.disabled) {
        const nbPlayersMax = parseInt(selectNbPlayers.value);
        socket.emit('setNbPlayersMax', { nbPlayersMax: nbPlayersMax }, (response) => { });
    }
}
socket.on('updatePlayersList', (params) => {
    const divPlayersList = document.getElementById('playersList');
    let playersData = Array.from(params);
    if (divPlayersList.children && divPlayersList.children.length > 0) {
        let indexPlayerCur = 0;
        for (const playerData of playersData) {
            const divPlayer = divPlayersList.children.item(indexPlayerCur);
            divPlayer.id = `params_setup_player_${playerData.id}`;
            divPlayer.textContent = playerData.name;
            indexPlayerCur++;
        }
        // empty remaining player divs        
        const nbPlayersMax = divPlayersList.children.length;
        if (indexPlayerCur < nbPlayersMax)
            for (let i = indexPlayerCur; i < nbPlayersMax; i++) {
                const divPlayer = divPlayersList.children.item(i);
                divPlayer.id = "";
                divPlayer.textContent = "...";
            }
    }
});
socket.on('updateNbPlayersMax', (params) => {
    const nbPlayersMax = params.nbPlayersMax;
    const selectNbPlayers = document.getElementById('gameNbPlayers');
    if (selectNbPlayers.disabled)
        selectNbPlayers.value = nbPlayersMax.toString();
    const divPlayersList = document.getElementById('playersList');
    let nbPlayersCur = divPlayersList.children.length;
    if (nbPlayersCur < nbPlayersMax)
        for (let i = nbPlayersCur + 1; i <= nbPlayersMax; i++) {
            const divPlayer = document.createElement('div');
            divPlayer.id = "";
            divPlayer.textContent = "...";
            divPlayersList.appendChild(divPlayer);
        }
    else if (nbPlayersCur > nbPlayersMax) {
        // remove and kick last overnumerous connected players
        while (nbPlayersCur > nbPlayersMax) {
            //const divPlayer = <HTMLDivElement>document.getElementById(`params_setup_player_${i}`);
            const divPlayer = divPlayersList.lastChild;
            // kick player if connected in room
            const playerIdPrefix = 'params_setup_player_';
            if (divPlayer.id && divPlayer.id.startsWith(playerIdPrefix)) {
                const id = divPlayer.id.replace(playerIdPrefix, "");
                //console.log("kick player", id);
                socket.emit('kickPlayer', { id: id }, (response) => { });
            }
            divPlayersList.removeChild(divPlayer);
            nbPlayersCur = divPlayersList.children.length;
        }
    }
});
function onPlay() {
    socket.emit('play', null, (response) => { });
}
socket.on('playGame', (params) => {
    document.getElementById('gameTitle').innerText
        = `Game ${params.room}`;
    setVisible("pageWelcome", false);
    setVisible("pageGameSetup", false);
    setVisible("pageGame", true);
});
//# sourceMappingURL=client.js.map