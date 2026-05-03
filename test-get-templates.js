async function test() {
  const sys = require("sys");
  const { getAllTemplates } = require("./lib/actions/questionnaire.actions");

  try {
    console.log("🔍 Testing getAllTemplates()...\n");
    const result = await getAllTemplates();
    console.log(
      "✅ Response:",
      JSON.stringify(result, null, 2).substring(0, 1000)
    );
    console.log(`\n📊 Total templates: ${result.templates?.length ?? "ERROR"}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }

  process.exit(0);
}

test();
