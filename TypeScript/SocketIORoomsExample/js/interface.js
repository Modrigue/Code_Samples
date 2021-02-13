"use strict";
window.onload = function () {
    // start on welcome page
    setVisible("pageGameSetup", false);
    const userName = document.getElementById('userName');
    userName.addEventListener('input', updateGUI);
    userName.focus();
    // welcome page
    const radioJoin = document.getElementById('radioJoinRoom');
    const radioCreate = document.getElementById('radioCreateRoom');
    radioJoin.addEventListener('change', selectJoinRoom);
    radioCreate.addEventListener('change', selectCreateRoom);
    const joinRoomName = document.getElementById('joinRoomName');
    const createRoomName = document.getElementById('createRoomName');
    joinRoomName.addEventListener('input', updateGUI);
    createRoomName.addEventListener('input', updateGUI);
    joinRoomName.addEventListener('keydown', (e) => onJoinCreateRoomKeyDown(e));
    createRoomName.addEventListener('keydown', (e) => onJoinCreateRoomKeyDown(e));
    const buttonSubmit = document.getElementById('buttonSubmit');
    buttonSubmit.addEventListener('click', onButtonClick);
    // game setup page
    const nbPlayers = document.getElementById('gameNbPlayers');
    nbPlayers.addEventListener('input', onNumberInput);
};
function updateGUI() {
    const userName = document.getElementById('userName');
    const nameEmpty = (userName.value === null || userName.value.length == 0);
    const mode = getSelectedRoomMode();
    // join room items
    document.getElementById('radioJoinRoom').disabled = nameEmpty;
    const joinRoomName = document.getElementById('joinRoomName');
    joinRoomName.disabled = nameEmpty || (mode == "create");
    // create room items
    document.getElementById('radioCreateRoom').disabled = nameEmpty;
    const createRoomName = document.getElementById('createRoomName');
    createRoomName.disabled = nameEmpty || (mode == "join");
    let room = getSelectedRoomName();
    document.getElementById('buttonSubmit').disabled = (nameEmpty || room.length == 0);
}
function selectJoinRoom() {
    updateGUI();
    const joinRoomName = document.getElementById('joinRoomName');
    if (!joinRoomName.disabled)
        joinRoomName.focus();
}
function selectCreateRoom() {
    updateGUI();
    const createRoomName = document.getElementById('createRoomName');
    if (!createRoomName.disabled)
        createRoomName.focus();
}
function onJoinCreateRoomKeyDown(e) {
    switch (e.key) {
        case 'Enter':
            onButtonClick();
            break;
    }
}
function getSelectedRoomMode() {
    // get selected mode
    const radiosMode = document.querySelectorAll('input[name="radioJoinCreateRoom"]');
    for (const radioMode of radiosMode)
        if (radioMode.checked)
            return radioMode.value;
    // not found
    return "";
}
function getSelectedRoomName() {
    let room = "";
    const joinRoomName = document.getElementById('joinRoomName');
    const createRoomName = document.getElementById('createRoomName');
    const mode = getSelectedRoomMode();
    switch (mode) {
        case "join":
            room = joinRoomName.value;
            break;
        case "create":
            room = createRoomName.value;
            break;
    }
    return room;
}
function setVisible(id, status) {
    let elem = document.getElementById(id);
    elem.style.display = status ? "block" : "none";
}
function setEnabled(id, status) {
    let elem = document.getElementById(id);
    elem.disabled = !status;
}
// limit nb. of characters to max length
function onNumberInput() {
    if (this.value.length > this.maxLength)
        this.value = this.value.slice(0, this.maxLength);
}
//# sourceMappingURL=interface.js.map