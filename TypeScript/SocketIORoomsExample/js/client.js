"use strict";
const DEPLOY_CLIENT = true;
let socket;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);
// player params
let selfID;
let creator = false;
let reconnecting = false;
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
    const password = document.getElementById('password').value;
    const mode = getSelectedRoomMode();
    switch (mode) {
        case 'join':
            socket.emit('joinRoom', { name: userName, room: room, password: password }, (response) => {
                if (response.error) {
                    alert(response.error);
                    //(<HTMLSelectElement>document.getElementById('joinRoomName')).selectedIndex = -1;
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
                    setEnabled("gameNbRounds", false);
                    setEnabled("buttonPlay", false);
                    document.getElementById('buttonPlay').innerText
                        = response.enablePlay ? "JOIN GAME" : "START GAME";
                    reconnecting = response.enablePlay;
                }
            });
            break;
        case 'create':
            socket.emit('createNewRoom', { name: userName, room: room, password: password }, (response) => {
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
                    setEnabled("gameNbRounds", true);
                    setEnabled("buttonPlay", false);
                    creator = true;
                }
            });
            break;
    }
}
socket.on('roomsList', (params) => {
    let roomsData = params.sort((a, b) => a.room.localeCompare(b.room)); // sort alphabetically
    // update room selector
    const roomSelect = document.getElementById("joinRoomName");
    while (roomSelect.options.length > 0)
        roomSelect.remove(0);
    for (const roomData of roomsData) {
        let option = document.createElement('option');
        option.value = roomData.room;
        option.textContent =
            `${roomData.room} - ${roomData.nbPlayers}/${roomData.nbPlayersMax} players - ${roomData.status}`;
        roomSelect.appendChild(option);
    }
    roomSelect.selectedIndex = -1;
});
/////////////////////////////// GAME SETUP PAGE ///////////////////////////////
socket.on('kickFromRoom', (params) => {
    if (params.id.length == 0 /* all */ || params.id == selfID) {
        if (params.id == selfID)
            alert(`You've been kicked from room '${params.room}'`);
        // return to welcome page
        document.getElementById('gameSetupTitle').innerText = `Welcome`;
        document.getElementById('joinRoomName').selectedIndex = -1;
        setVisible("pageWelcome", true);
        setVisible("pageGameSetup", false);
    }
    updatePlayButton();
});
function onNumberInput() {
    // limit nb. of characters to max length
    if (this.value.length > this.maxLength)
        this.value = this.value.slice(0, this.maxLength);
    // update max. nb. players in room
    const imputNbPlayers = document.getElementById('gameNbPlayers');
    const inputNbRounds = document.getElementById('gameNbRounds');
    if (!imputNbPlayers.disabled && !inputNbRounds.disabled) {
        const nbPlayersMax = parseInt(imputNbPlayers.value);
        const nbRounds = parseInt(inputNbRounds.value);
        socket.emit('setRoomParams', { nbPlayersMax: nbPlayersMax, nbRounds: nbRounds }, (response) => { });
    }
}
socket.on('updatePlayersList', (params) => {
    const divPlayersList = document.getElementById('playersList');
    if (divPlayersList.children && divPlayersList.children.length > 0) {
        let indexPlayerCur = 0;
        for (const playerData of params) {
            // create player options
            const divPlayer = divPlayersList.children.item(indexPlayerCur);
            divPlayer.id = `params_setup_player_${playerData.id}`;
            divPlayer.children.item(0).textContent = playerData.name;
            // own player options
            if (playerData.id == selfID) {
                divPlayer.style.fontWeight = "bold";
                for (let i = 1; i < divPlayer.children.length; i++)
                    divPlayer.children.item(i).disabled = false;
            }
            indexPlayerCur++;
        }
        // empty remaining player divs        
        const nbPlayersMax = divPlayersList.children.length;
        if (indexPlayerCur < nbPlayersMax)
            for (let i = indexPlayerCur; i < nbPlayersMax; i++) {
                const divPlayer = divPlayersList.children.item(i);
                divPlayer.id = "";
                divPlayer.children.item(0).textContent = "...";
            }
    }
    updatePlayButton();
});
socket.on('updateRoomParams', (params) => {
    // update nb. players max
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
            // name
            const labelPlayerName = document.createElement('label');
            labelPlayerName.textContent = "...";
            divPlayer.appendChild(labelPlayerName);
            // color
            const inputPlayerColor = document.createElement('input');
            inputPlayerColor.type = "color";
            inputPlayerColor.value = "#0000ff";
            inputPlayerColor.disabled = true;
            inputPlayerColor.addEventListener('change', setPlayerParams);
            divPlayer.appendChild(inputPlayerColor);
            // team
            const selectPlayerTeam = document.createElement('select');
            for (let i = 1; i <= 2; i++) {
                let option = document.createElement('option');
                option.value = i.toString();
                option.textContent = `Team ${i}`;
                selectPlayerTeam.appendChild(option);
            }
            selectPlayerTeam.selectedIndex = -1;
            selectPlayerTeam.disabled = true;
            selectPlayerTeam.addEventListener('change', setPlayerParams);
            divPlayer.appendChild(selectPlayerTeam);
            // ready
            const checkboxReady = document.createElement('input');
            checkboxReady.type = "checkbox";
            checkboxReady.textContent = "Ready";
            checkboxReady.disabled = true;
            checkboxReady.addEventListener('change', setPlayerParams);
            divPlayer.appendChild(checkboxReady);
            divPlayersList.appendChild(divPlayer);
        }
    else if (nbPlayersCur > nbPlayersMax) {
        // remove and kick last overnumerous connected players
        while (nbPlayersCur > nbPlayersMax) {
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
    // update nb. rounds
    const selectNbRounds = document.getElementById('gameNbRounds');
    if (selectNbRounds.disabled)
        selectNbRounds.value = params.nbRounds.toString();
    updatePlayButton();
});
// send player params
function setPlayerParams() {
    // get player color
    const divPlayer = document.getElementById(`params_setup_player_${selfID}`);
    const color = divPlayer.children.item(1).value;
    // get player team
    const team = divPlayer.children.item(2).value;
    // player ready?
    const ready = divPlayer.children.item(3).checked;
    socket.emit('setPlayerParams', { color: color, team: team, ready: ready }, (response) => { });
}
// update player params
socket.on('updatePlayersParams', (params) => {
    for (const playerParams of params) {
        const id = playerParams.id;
        if (id == selfID)
            continue; // nop
        let divPlayer = document.getElementById(`params_setup_player_${id}`);
        if (divPlayer === null)
            continue;
        // update other player parameters
        divPlayer.children.item(1).value = playerParams.color;
        divPlayer.children.item(2).value = playerParams.team;
        divPlayer.children.item(3).checked = playerParams.ready;
    }
    updatePlayButton();
});
function updatePlayButton() {
    if (!creator && !reconnecting) {
        setEnabled("buttonPlay", false);
        return;
    }
    // get max. nb. players
    const imputNbPlayers = document.getElementById('gameNbPlayers');
    const nbPlayersMax = parseInt(imputNbPlayers.value);
    // get current nb. players
    let nbPlayers = 0;
    const divPlayersList = document.getElementById('playersList');
    for (const divPlayer of divPlayersList.children) {
        const playerIdPrefix = 'params_setup_player_';
        if (divPlayer.id && divPlayer.id.startsWith(playerIdPrefix))
            nbPlayers++;
    }
    const nbPlayersCorrect = (nbPlayers == nbPlayersMax);
    // get current players teams
    let hasTeam1 = false;
    let hasTeam2 = false;
    for (const divPlayer of divPlayersList.children) {
        const team = divPlayer.children.item(2).value;
        if (team == "1")
            hasTeam1 = true;
        else if (team == "2")
            hasTeam2 = true;
    }
    let teamsCorrect = (hasTeam1 && hasTeam2);
    if (nbPlayersMax == 1)
        teamsCorrect = (hasTeam1 || hasTeam2);
    // get ready states
    let ready = true;
    for (const divPlayer of divPlayersList.children)
        ready && (ready = divPlayer.children.item(3).checked);
    setEnabled("buttonPlay", nbPlayersCorrect && teamsCorrect && ready);
}
function onPlay() {
    socket.emit('play', null, (response) => { });
}
socket.on('playGame', (params) => {
    document.getElementById('gameTitle').innerText
        = `Game ${params.room} - ${params.nbPlayersMax} players - ${params.nbRounds} rounds`;
    setVisible("pageWelcome", false);
    setVisible("pageGameSetup", false);
    setVisible("pageGame", true);
});
//# sourceMappingURL=client.js.map