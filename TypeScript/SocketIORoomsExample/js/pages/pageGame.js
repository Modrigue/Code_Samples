"use strict";
socket.on('playGame', (params) => {
    document.getElementById('gameTitle').innerText
        = `Game ${params.room} - ${params.nbPlayersMax} players - ${params.nbRounds} rounds`;
    setVisible("pageWelcome", false);
    setVisible("pageGameSetup", false);
    setVisible("pageGame", true);
});
//# sourceMappingURL=pageGame.js.map