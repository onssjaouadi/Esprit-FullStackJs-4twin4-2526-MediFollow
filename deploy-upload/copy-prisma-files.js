const fs = require("fs");

console.log("🔄 Copying Prisma files from nurse folder...\n");

// Copy schema-additions if it exists
if (fs.existsSync("nurse/prisma/schema-additions.prisma")) {
  fs.copyFileSync(
    "nurse/prisma/schema-additions.prisma",
    "prisma/schema-additions.prisma"
  );
  console.log("✓ Copied schema-additions.prisma");
}

// Copy seed if it exists
if (fs.existsSync("nurse/prisma/seed.ts")) {
  fs.copyFileSync("nurse/prisma/seed.ts", "prisma/seed.ts");
  console.log("✓ Copied seed.ts");
}

console.log("\n✅ Prisma files updated!");
console.log("\nNext steps:");
console.log("1. Run: npm run prisma:generate");
console.log("2. Run: npm run prisma:push (if needed)");
