window.onload = function()
{
    const userName: HTMLInputElement = <HTMLInputElement>document.getElementById('userName');
    userName.addEventListener('input', updateGUI)
    userName.focus();

    const radioJoin: HTMLInputElement = <HTMLInputElement>document.getElementById('radioJoinRoom');
    const radioCreate: HTMLInputElement = <HTMLInputElement>document.getElementById('radioCreateRoom');
    radioJoin.addEventListener('change', updateGUI);
    radioCreate.addEventListener('change', updateGUI);

    const joinRoomName: HTMLInputElement = <HTMLInputElement>document.getElementById('joinRoomName');
    const createRoomName: HTMLInputElement = <HTMLInputElement>document.getElementById('createRoomName');
    joinRoomName.addEventListener('input', updateGUI);
    createRoomName.addEventListener('input', updateGUI);
}

function updateGUI()
{
    const userName: HTMLInputElement = <HTMLInputElement>document.getElementById('userName');
    const nameEmpty: boolean = (userName.value === null || userName.value.length == 0);
    const mode: string = getSelectedRoomMode();

    // join room items
    (<HTMLInputElement>document.getElementById('radioJoinRoom')).disabled = nameEmpty;
    const joinRoomName: HTMLInputElement = <HTMLInputElement>document.getElementById('joinRoomName');
    joinRoomName.disabled = nameEmpty || (mode == "create");

    // create room items
    (<HTMLInputElement>document.getElementById('radioCreateRoom')).disabled = nameEmpty;
    const createRoomName: HTMLInputElement = <HTMLInputElement>document.getElementById('createRoomName');
    createRoomName.disabled = nameEmpty || (mode == "join");

    let room: string = "";
    switch(mode)
    {
        case "join":
            room = joinRoomName.value;
            break;

        case "create":
            room = createRoomName.value;
            break;
    }

    (<HTMLButtonElement>document.getElementById('buttonSubmit')).disabled = (nameEmpty || room.length == 0);
}

function getSelectedRoomMode(): string
{
    // get selected mode
    const radiosMode: NodeListOf<HTMLInputElement> = <NodeListOf<HTMLInputElement>>document.querySelectorAll('input[name="radioJoinCreateRoom"]');
    for (const radioMode of radiosMode)
        if (radioMode.checked)
            return radioMode.value;

    // not found
    return "";
}