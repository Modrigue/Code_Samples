const DEPLOY_CLIENT: boolean = true;

let socket: any;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);

// player params
let selfID: string;
let creator: boolean = false;
let reconnecting: boolean = false;


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

    const password = (<HTMLInputElement>document.getElementById('password')).value;

    const mode: string = getSelectedRoomMode();
    switch (mode)
    {
        case 'join':
            socket.emit('joinRoom', {name: userName, room: room, password: password}, (response: any) => {
        
                if (response.error)
                {
                    alert(response.error);
                    //(<HTMLSelectElement>document.getElementById('joinRoomName')).selectedIndex = -1;
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
                    setEnabled("gameNbRounds", false);
                    setEnabled("buttonPlay", false);
                    (<HTMLButtonElement>document.getElementById('buttonPlay')).innerText
                        = response.enablePlay ? "JOIN GAME" : "START GAME";

                    reconnecting = response.enablePlay;
                }
            });
            break;
    
        case 'create':
            socket.emit('createNewRoom', {name: userName, room: room, password: password}, (response: any) => {
        
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
                    setEnabled("gameNbRounds", true);
                    setEnabled("buttonPlay", false);

                    creator = true;
                }
            });
            break;
    } 
}

socket.on('roomsList', (params: Array<{room: string, nbPlayersMax: number, nbPlayers: number, status: string}>) =>
{
    let roomsData = params.sort((a, b) => a.room.localeCompare(b.room)); // sort alphabetically
    
    // update room selector

    const roomSelect = <HTMLSelectElement>document.getElementById("joinRoomName");

    while (roomSelect.options.length > 0)         
        roomSelect.remove(0);

    for (const roomData of roomsData)
    {        
        let option = document.createElement('option');
        option.value = roomData.room;
        option.textContent =
            `${roomData.room} - ${roomData.nbPlayers}/${roomData.nbPlayersMax} players - ${roomData.status}`;
        roomSelect.appendChild(option);    
    }

    roomSelect.selectedIndex = -1;
});


/////////////////////////////// GAME SETUP PAGE ///////////////////////////////


socket.on('kickFromRoom', (params: {room: string, id: string}) => {
    if (params.id.length == 0 /* all */ || params.id == selfID)
    {
        if (params.id == selfID)
            alert(`You've been kicked from room '${params.room}'`);

        // return to welcome page
        (<HTMLParagraphElement>document.getElementById('gameSetupTitle')).innerText = `Welcome`;
        (<HTMLSelectElement>document.getElementById('joinRoomName')).selectedIndex = -1;
        setVisible("pageWelcome", true);
        setVisible("pageGameSetup", false);
    }

    updatePlayButton();
});

function onNumberInput(): void
{
    // limit nb. of characters to max length
    if (this.value.length > this.maxLength)
        this.value = this.value.slice(0, this.maxLength);

    // update max. nb. players in room
    const imputNbPlayers = <HTMLInputElement>document.getElementById('gameNbPlayers');
    const inputNbRounds = <HTMLInputElement>document.getElementById('gameNbRounds');
    if (!imputNbPlayers.disabled && !inputNbRounds.disabled)
    {
        const nbPlayersMax = <number>parseInt(imputNbPlayers.value);
        const nbRounds = <number>parseInt(inputNbRounds.value);
        socket.emit('setRoomParams', {nbPlayersMax: nbPlayersMax, nbRounds: nbRounds}, (response: any) => {});
    }
}

socket.on('updatePlayersList', (params: Array<{id: string, name: string}>) => {

    const divPlayersList = <HTMLDivElement>document.getElementById('playersList');    
    if (divPlayersList.children && divPlayersList.children.length > 0)
    {
        let indexPlayerCur = 0;
        for (const playerData of params)
        {
            // create player options
            const divPlayer = <HTMLDivElement>divPlayersList.children.item(indexPlayerCur);
            divPlayer.id = `params_setup_player_${playerData.id}`;
            (<HTMLDivElement>divPlayer.children.item(0)).textContent = playerData.name;

            // own player options
            if (playerData.id == selfID)
            {
                divPlayer.style.fontWeight = "bold";
                for (let i = 1; i < divPlayer.children.length; i++)
                    (<HTMLInputElement>divPlayer.children.item(i)).disabled = false;
            }

            indexPlayerCur++;
        }

        // empty remaining player divs        
        const nbPlayersMax = divPlayersList.children.length;
        if (indexPlayerCur < nbPlayersMax)
            for (let i = indexPlayerCur; i < nbPlayersMax; i++)
            {
                const divPlayer = <HTMLDivElement>divPlayersList.children.item(i);
                divPlayer.id = "";
                (<HTMLDivElement>divPlayer.children.item(0)).textContent ="...";
            }
    }

    updatePlayButton();
});

socket.on('updateRoomParams', (params: {room: string, nbPlayersMax: number, nbRounds: number}) => {

    // update nb. players max

    const nbPlayersMax = params.nbPlayersMax;
    const selectNbPlayers = <HTMLInputElement>document.getElementById('gameNbPlayers');
    if (selectNbPlayers.disabled)
        selectNbPlayers.value = nbPlayersMax.toString();
        
    const divPlayersList = <HTMLDivElement>document.getElementById('playersList');
    let nbPlayersCur = divPlayersList.children.length;

    if (nbPlayersCur < nbPlayersMax)
        for (let i = nbPlayersCur + 1; i <= nbPlayersMax; i++)
        {
            const divPlayer = <HTMLDivElement>document.createElement('div');
            divPlayer.id = "";

            // name
            const labelPlayerName = <HTMLLabelElement>document.createElement('label');
            labelPlayerName.textContent = "...";
            divPlayer.appendChild(labelPlayerName);

            // color
            const inputPlayerColor = <HTMLInputElement>document.createElement('input');
            inputPlayerColor.type = "color";
            inputPlayerColor.value = "#0000ff";
            inputPlayerColor.disabled = true;
            inputPlayerColor.addEventListener('change', setPlayerParams);
            divPlayer.appendChild(inputPlayerColor);

            // team
            const selectPlayerTeam = <HTMLSelectElement>document.createElement('select');
            for (let i = 1; i <= 2; i++)
            {
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
            const checkboxReady = <HTMLInputElement>document.createElement('input');
            checkboxReady.type = "checkbox";
            checkboxReady.textContent = "Ready";
            checkboxReady.disabled = true;
            checkboxReady.addEventListener('change', setPlayerParams);
            divPlayer.appendChild(checkboxReady);

            divPlayersList.appendChild(divPlayer);
        }
    else if (nbPlayersCur > nbPlayersMax)
    {
        // remove and kick last overnumerous connected players
        while (nbPlayersCur > nbPlayersMax)
        {
            const divPlayer = <HTMLDivElement>divPlayersList.lastChild;

            // kick player if connected in room
            const playerIdPrefix = 'params_setup_player_';
            if (divPlayer.id && divPlayer.id.startsWith(playerIdPrefix))
            {
                const id: string = divPlayer.id.replace(playerIdPrefix, "");
                //console.log("kick player", id);
                socket.emit('kickPlayer', {id: id}, (response: any) => {});
            }

            divPlayersList.removeChild(divPlayer);
            nbPlayersCur = divPlayersList.children.length;
        }
    }

    // update nb. rounds
    const selectNbRounds = <HTMLInputElement>document.getElementById('gameNbRounds');
    if (selectNbRounds.disabled)
        selectNbRounds.value = params.nbRounds.toString();

    updatePlayButton();
});

// send player params
function setPlayerParams()
{
    // get player color
    const divPlayer = <HTMLDivElement>document.getElementById(`params_setup_player_${selfID}`);
    const color = (<HTMLInputElement>divPlayer.children.item(1)).value;

    // get player team
    const team = (<HTMLInputElement>divPlayer.children.item(2)).value;

    // player ready?
    const ready = (<HTMLInputElement>divPlayer.children.item(3)).checked;

    socket.emit('setPlayerParams', {color: color, team: team, ready: ready}, (response: any) => {});
}

// update player params
socket.on('updatePlayersParams', (params:  Array<{id: string, color: string, team: string, ready: boolean}>) => {

    for (const playerParams of params)
    {
        const id = playerParams.id;
        if (id == selfID)
            continue; // nop

        let divPlayer = <HTMLDivElement>document.getElementById(`params_setup_player_${id}`);
        if (divPlayer === null)
            continue;

        // update other player parameters
        (<HTMLInputElement>divPlayer.children.item(1)).value = playerParams.color;
        (<HTMLSelectElement>divPlayer.children.item(2)).value = playerParams.team;
        (<HTMLInputElement>divPlayer.children.item(3)).checked = playerParams.ready;
    }

    updatePlayButton();
});

function updatePlayButton()
{
    if (!creator && !reconnecting)
    {
        setEnabled("buttonPlay", false);
        return;
    }

    // get max. nb. players
    const imputNbPlayers = <HTMLInputElement>document.getElementById('gameNbPlayers');
    const nbPlayersMax = <number>parseInt(imputNbPlayers.value);

    // get current nb. players
    let nbPlayers: number = 0;
    const divPlayersList = <HTMLDivElement>document.getElementById('playersList');
    for (const divPlayer of divPlayersList.children)
    {
        const playerIdPrefix = 'params_setup_player_';
        if (divPlayer.id && divPlayer.id.startsWith(playerIdPrefix))
            nbPlayers++;
    }
    const nbPlayersCorrect: boolean = (nbPlayers == nbPlayersMax);

    // get current players teams
    let hasTeam1: boolean = false;
    let hasTeam2: boolean = false;
    for (const divPlayer of divPlayersList.children)
    {
        const team = (<HTMLSelectElement>divPlayer.children.item(2)).value;
        if (team == "1")
            hasTeam1 = true;
        else if (team == "2")
            hasTeam2 = true;
    }
    let teamsCorrect: boolean = (hasTeam1 && hasTeam2);
    if (nbPlayersMax == 1)
        teamsCorrect = (hasTeam1 || hasTeam2);

    // get ready states
    let ready: boolean = true;
    for (const divPlayer of divPlayersList.children)
        ready &&= (<HTMLInputElement>divPlayer.children.item(3)).checked;

    setEnabled("buttonPlay", nbPlayersCorrect && teamsCorrect && ready);
}

function onPlay()
{
    socket.emit('play', null, (response: any) => {});
}

socket.on('playGame', (params: {room: string}) => {

    (<HTMLParagraphElement>document.getElementById('gameTitle')).innerText
        = `Game ${params.room}`;

    setVisible("pageWelcome", false);
    setVisible("pageGameSetup", false);
    setVisible("pageGame", true);
});