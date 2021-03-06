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