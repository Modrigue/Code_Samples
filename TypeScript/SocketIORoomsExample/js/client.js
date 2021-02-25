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
socket.on('connect', () => {
    selfID = socket.id;
});
//# sourceMappingURL=client.js.map