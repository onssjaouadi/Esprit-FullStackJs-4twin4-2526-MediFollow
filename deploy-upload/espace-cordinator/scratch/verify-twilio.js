const twilio = require('twilio');

const accountSid = 'AC4f8fc8b6e0e1898bb08e7820c1838c09';
const authToken = 'f59fbdc1643c82a6edf697199ba51955';

async function listNumbers() {
  console.log("Fetching account details to verify credentials...");
  const client = twilio(accountSid, authToken);

  try {
    const account = await client.api.v2010.accounts(accountSid).fetch();
    console.log("Account found:", account.friendlyName);
    console.log("Status:", account.status);

    const numbers = await client.incomingPhoneNumbers.list({limit: 5});
    console.log("\nAvailable Phone Numbers:");
    if (numbers.length === 0) {
      console.log("No numbers found in this account.");
    }
    numbers.forEach(n => {
      console.log(`- ${n.phoneNumber} (${n.friendlyName})`);
    });
  } catch (error) {
    console.error("VERIFICATION FAILED!");
    console.error(error.message);
  }
}

listNumbers();
