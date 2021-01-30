function GetCurrentDateTime() : string
{
   const today : Date= new Date();
   const date : string = `${today.getUTCFullYear()}-${pad2Digits(today.getUTCMonth()+1)}-${pad2Digits(today.getUTCDay())}`;
   const time : string  = `${pad2Digits(today.getUTCHours())}:${pad2Digits(today.getUTCMinutes())}:${pad2Digits(today.getUTCSeconds())}`;
   const dateTime : string  = `${date}T${time}`;

   return dateTime;
}

function pad2Digits(number: number): string
{
   return ("0" + number.toString()).slice(-2);
}

module.exports = GetCurrentDateTime;