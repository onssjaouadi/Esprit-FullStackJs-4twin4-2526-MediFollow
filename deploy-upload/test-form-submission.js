/**
 * Test vital record form submission
 */
const http = require("http");

async function testFormSubmission() {
  const patientId = "670c1e57a62f08e3b1e76c8c"; // One of the assigned patients
  const vitalData = new URLSearchParams();
  vitalData.append("systolicBP", "150");
  vitalData.append("diastolicBP", "95");
  vitalData.append("heartRate", "88");
  vitalData.append("temperature", "36.5");
  vitalData.append("oxygenSaturation", "97");
  vitalData.append("weight", "75");
  vitalData.append("notes", "Test vital record");

  const options = {
    hostname: "localhost",
    port: 3003,
    path: `/dashboard/nurse/enter-data`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": vitalData.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        console.log("Status Code:", res.statusCode);
        console.log("Response:", data.substring(0, 500));
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true, status: res.statusCode });
        } else {
          resolve({ success: false, status: res.statusCode });
        }
      });
    });

    req.on("error", (error) => {
      console.error("Error:", error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(vitalData);
    req.end();
  });
}

console.log("Testing form submission...");
setTimeout(() => {
  testFormSubmission().then((result) => {
    console.log("Test Result:", result);
    process.exit(result.success ? 0 : 1);
  });
}, 5000);
