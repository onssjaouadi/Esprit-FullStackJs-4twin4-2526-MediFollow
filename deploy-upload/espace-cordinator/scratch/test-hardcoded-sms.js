const twilio = require('twilio');

const accountSid = 'AC4f8fc8b6e0e1898bb08e7820c1838c09';
const authToken = 'f59fbdc1643c82a6edf697199ba51955';
const fromNumber = '+19133928785';
const toNumber = '+21628609851';

async function testSMS() {
  console.log("Hardcoded Twilio Test...");
  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      body: 'MediFollow SMS Test - Final Attempt',
      from: fromNumber,
      to: toNumber
    });

    console.log("SUCCESS!");
    console.log("SID:", message.sid);
  } catch (error) {
    console.error("FAILED!");
    console.error(error.message);
  }
}

testSMS();
