window.onload = function()
{
    // start on welcome page
    setVisible("pageGameSetup", false);

    const userName = <HTMLInputElement>document.getElementById('userName');
    userName.addEventListener('input', updateGUI)
    userName.focus();

    // welcome page

    const radioJoin = <HTMLInputElement>document.getElementById('radioJoinRoom');
    const radioCreate = <HTMLInputElement>document.getElementById('radioCreateRoom');
    radioJoin.addEventListener('change', selectJoinRoom);
    radioCreate.addEventListener('change', selectCreateRoom);

    const joinRoomName = <HTMLSelectElement>document.getElementById('joinRoomName');
    const createRoomName = <HTMLInputElement>document.getElementById('createRoomName');
    joinRoomName.addEventListener('input', updateGUI);
    createRoomName.addEventListener('input', updateGUI);
    joinRoomName.addEventListener('keydown', (e) => onJoinCreateRoomKeyDown(e));
    createRoomName.addEventListener('keydown', (e) => onJoinCreateRoomKeyDown(e));

    const buttonSubmit = <HTMLButtonElement>document.getElementById('buttonSubmit');
    buttonSubmit.addEventListener('click', onButtonClick);

    // game setup page

    const nbPlayers = <HTMLInputElement>document.getElementById('gameNbPlayers');
    nbPlayers.addEventListener('input', onNumberInput);
}

function updateGUI()
{
    const userName = <HTMLInputElement>document.getElementById('userName');
    const nameEmpty: boolean = (userName.value === null || userName.value.length == 0);
    const mode: string = getSelectedRoomMode();

    // join room items
    (<HTMLInputElement>document.getElementById('radioJoinRoom')).disabled = nameEmpty;
    const joinRoomName = <HTMLSelectElement>document.getElementById('joinRoomName');
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

    const joinRoomName = <HTMLSelectElement>document.getElementById('joinRoomName');
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

function setVisible(id: string, status: boolean): void
{
    let elem: HTMLElement = <HTMLElement>document.getElementById(id);
    elem.style.display = status ? "block" : "none";
}

function setEnabled(id: string, status: boolean): void
{
    let elem: any = document.getElementById(id);
    elem.disabled = !status;
}

// limit nb. of characters to max length
function onNumberInput(): void
{
    if (this.value.length > this.maxLength)
        this.value = this.value.slice(0, this.maxLength);
}