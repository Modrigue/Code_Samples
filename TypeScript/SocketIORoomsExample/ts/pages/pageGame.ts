socket.on('playGame', (params: {room: string, nbPlayersMax: string, nbRounds: string}) => {

    (<HTMLParagraphElement>document.getElementById('gameTitle')).innerText
        = `Game ${params.room} - ${params.nbPlayersMax} players - ${params.nbRounds} rounds`;

    setVisible("pageWelcome", false);
    setVisible("pageGameSetup", false);
    setVisible("pageGame", true);
});