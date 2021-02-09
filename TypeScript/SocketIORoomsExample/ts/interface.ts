window.onload = function()
{
    const userName = <HTMLInputElement>document.getElementById('userName');
    userName.addEventListener('input', updateGUI)
    userName.focus();

    const radioJoin = <HTMLInputElement>document.getElementById('radioJoinRoom');
    const radioCreate = <HTMLInputElement>document.getElementById('radioCreateRoom');
    radioJoin.addEventListener('change', selectJoinRoom);
    radioCreate.addEventListener('change', selectCreateRoom);

    const joinRoomName = <HTMLInputElement>document.getElementById('joinRoomName');
    const createRoomName = <HTMLInputElement>document.getElementById('createRoomName');
    joinRoomName.addEventListener('input', updateGUI);
    createRoomName.addEventListener('input', updateGUI);
    joinRoomName.addEventListener('keydown', (e) => onJoinCreateRoomKeyDown(e));
    createRoomName.addEventListener('keydown', (e) => onJoinCreateRoomKeyDown(e));

    const buttonSubmit = <HTMLButtonElement>document.getElementById('buttonSubmit');
    buttonSubmit.addEventListener('click', onButtonClick);
}

function updateGUI()
{
    const userName = <HTMLInputElement>document.getElementById('userName');
    const nameEmpty: boolean = (userName.value === null || userName.value.length == 0);
    const mode: string = getSelectedRoomMode();

    // join room items
    (<HTMLInputElement>document.getElementById('radioJoinRoom')).disabled = nameEmpty;
    const joinRoomName = <HTMLInputElement>document.getElementById('joinRoomName');
    joinRoomName.disabled = nameEmpty || (mode == "create");

    // create room items
    (<HTMLInputElement>document.getElementById('radioCreateRoom')).disabled = nameEmpty;
    const createRoomName = <HTMLInputElement>document.getElementById('createRoomName');
    createRoomName.disabled = nameEmpty || (mode == "join");

    let room: string = getSelectedRoomName();
    (<HTMLButtonElement>document.getElementById('buttonSubmit')).disabled = (nameEmpty || room.length == 0);
}

function selectJoinRoom()
{
    updateGUI();
    const joinRoomName = <HTMLSelectElement>document.getElementById('joinRoomName');

    if (!joinRoomName.disabled)
        joinRoomName.focus();
}

function selectCreateRoom()
{
    updateGUI();
    const createRoomName = <HTMLInputElement>document.getElementById('createRoomName');

    if (!createRoomName.disabled)
        createRoomName.focus();
}

function onJoinCreateRoomKeyDown(e: any)
{
    switch(e.key)
    {
        case 'Enter':
            onButtonClick();
            break;
    }
}

function getSelectedRoomMode(): string
{
    // get selected mode
    const radiosMode = <NodeListOf<HTMLInputElement>>document.querySelectorAll('input[name="radioJoinCreateRoom"]');
    for (const radioMode of radiosMode)
        if (radioMode.checked)
            return radioMode.value;

    // not found
    return "";
}

function getSelectedRoomName(): string
{
    let room: string = "";

    const joinRoomName = <HTMLInputElement>document.getElementById('joinRoomName');
    const createRoomName = <HTMLInputElement>document.getElementById('createRoomName');
    const mode: string = getSelectedRoomMode();
    switch(mode)
    {
        case "join":
            room = joinRoomName.value;
            break;

        case "create":
            room = createRoomName.value;
            break;
    }

    return room;
}