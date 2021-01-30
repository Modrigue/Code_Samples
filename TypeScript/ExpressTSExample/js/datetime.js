"use strict";
function GetCurrentDateTime() {
    const today = new Date();
    const date = `${today.getUTCFullYear()}-${pad2Digits(today.getUTCMonth() + 1)}-${pad2Digits(today.getUTCDay())}`;
    const time = `${pad2Digits(today.getUTCHours())}:${pad2Digits(today.getUTCMinutes())}:${pad2Digits(today.getUTCSeconds())}`;
    const dateTime = `${date}T${time}`;
    return dateTime;
}
function pad2Digits(number) {
    return ("0" + number.toString()).slice(-2);
}
module.exports = GetCurrentDateTime;
//# sourceMappingURL=datetime.js.map