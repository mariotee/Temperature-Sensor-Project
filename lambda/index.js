const twilio = require('twilio');
const accountSid = 'ENTER SSID';
const authToken = 'ENTER TOKEN';

const client = new twilio(accountSid,authToken);
const twilioNumber = 'ENTER NUMBER';

exports.handler = async (event) => {
  let sendBody;

  switch(event.status) {
    case 0: sendBody = "too hot";
      break;
    case 1: sendBody = "too cold";
      break;
    default: sendBody = "ERROR status";
      break;
  }

  let res = await client.messages.create({
    body: sendBody,
    to: event.phoneNumber,
    from: twilioNumber,
  });
  
  return res.sid;
}