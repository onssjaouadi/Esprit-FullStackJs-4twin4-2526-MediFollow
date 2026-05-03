const fs = require("fs");

// Read source schema
const sourceSchema = fs.readFileSync("nurse/prisma/schema.prisma", "utf8");

// Write to destination
fs.writeFileSync("prisma/schema.prisma", sourceSchema);

console.log("✓ Prisma schema replaced successfully");
console.log("✓ File size: " + (sourceSchema.length / 1024).toFixed(2) + " KB");
