const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = "+21628609851";

async function testSMS() {
  console.log("Testing Twilio SMS...");
  console.log(`SID: ${accountSid}`);
  console.log(`From: ${fromNumber}`);
  console.log(`To: ${toNumber}`);

  if (!accountSid || accountSid.includes("xxx")) {
    console.error("Missing Twilio Account SID");
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      body: 'Test SMS from MediFollow Platform',
      from: fromNumber,
      to: toNumber
    });

    console.log("SMS Sent Successfully!");
    console.log(`Message SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
  } catch (error) {
    console.error("SMS Failed!");
    console.error(error.message);
    if (error.code === 21606) {
      console.log("\nTIP: The 'From' number is not a valid Twilio number or not verified as a Caller ID.");
    }
  }
}

testSMS();
