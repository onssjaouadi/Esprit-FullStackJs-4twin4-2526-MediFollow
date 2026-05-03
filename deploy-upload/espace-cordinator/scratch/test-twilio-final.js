const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const toNumber = '+21628609851';

async function testSMS() {
  console.log("Twilio Final Test (via Messaging Service)...");
  console.log(`SID: ${accountSid}`);
  console.log(`Service SID: ${messagingServiceSid}`);

  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      body: 'MediFollow SMS Test - Final Activation Successful!',
      messagingServiceSid: messagingServiceSid,
      to: toNumber
    });

    console.log("SUCCESS!");
    console.log("Message SID:", message.sid);
    console.log("Status:", message.status);
  } catch (error) {
    console.error("FAILED!");
    console.error(error.message);
  }
}

testSMS();
