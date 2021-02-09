"use strict";
window.onload = function () {
    const userName = document.getElementById('userName');
    userName.addEventListener('input', updateGUI);
    userName.focus();
    const radioJoin = document.getElementById('radioJoinRoom');
    const radioCreate = document.getElementById('radioCreateRoom');
    radioJoin.addEventListener('change', updateGUI);
    radioCreate.addEventListener('change', updateGUI);
    const joinRoomName = document.getElementById('joinRoomName');
    const createRoomName = document.getElementById('createRoomName');
    joinRoomName.addEventListener('input', updateGUI);
    createRoomName.addEventListener('input', updateGUI);
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
    let room = "";
    switch (mode) {
        case "join":
            room = joinRoomName.value;
            break;
        case "create":
            room = createRoomName.value;
            break;
    }
    document.getElementById('buttonSubmit').disabled = (nameEmpty || room.length == 0);
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
//# sourceMappingURL=interface.js.map