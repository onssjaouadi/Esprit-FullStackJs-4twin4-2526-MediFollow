const fs = require("fs");
const path = require("path");

function copyRecursive(src, dest) {
  try {
    // Créer dossier de destination s'il n'existe pas
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Lire les fichiers du source
    const files = fs.readdirSync(src);

    files.forEach((file) => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      // Si c'est un dossier, copier récursivement
      if (fs.statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        // Copier le fichier
        fs.copyFileSync(srcPath, destPath);
      }
    });
  } catch (err) {
    console.error(`Error copying from ${src} to ${dest}:`, err.message);
  }
}

const basePath = __dirname;
const copies = [
  // PRIORITY 1
  {
    src: "nurse/app/dashboard/nurse",
    dest: "app/dashboard/nurse",
    name: "Nurse Dashboard",
  },
  {
    src: "nurse/components/nurse",
    dest: "components/nurse",
    name: "Nurse Components",
  },

  // PRIORITY 2 - Shared Components
  {
    src: "nurse/components/forms",
    dest: "components/forms",
    name: "Form Components",
  },
  {
    src: "nurse/components/table",
    dest: "components/table",
    name: "Table Components",
  },
  { src: "nurse/components/ui", dest: "components/ui", name: "UI Components" },

  // Individual component files
  {
    src: "nurse/components",
    dest: "components",
    name: "All Root Components",
    onlyFiles: true,
  },

  // PRIORITY 2 - Server Actions
  { src: "nurse/lib/actions", dest: "lib/actions", name: "Server Actions" },

  // PRIORITY 2 - Types
  { src: "nurse/types", dest: "types", name: "Type Definitions" },

  // PRIORITY 2 - AI Services
  { src: "nurse/lib/ai", dest: "lib/ai", name: "AI Services" },

  // PRIORITY 3 - Shared Resources
  { src: "nurse/lib/utils", dest: "lib/utils", name: "Utils" },
  { src: "nurse/hooks", dest: "hooks", name: "Hooks" },
  { src: "nurse/constants", dest: "constants", name: "Constants" },
  { src: "nurse/contexts", dest: "contexts", name: "Contexts" },
];

console.log("🚀 Starting Nurse Space Replacement...\n");

copies.forEach((copy, index) => {
  const srcPath = path.join(basePath, copy.src);
  const destPath = path.join(basePath, copy.dest);

  if (fs.existsSync(srcPath)) {
    try {
      if (copy.onlyFiles) {
        // Copy only .tsx and .ts files from src, skip subdirectories that are already handled
        const files = fs.readdirSync(srcPath).filter((f) => {
          const stat = fs.statSync(path.join(srcPath, f));
          return (
            !stat.isDirectory() &&
            (f.endsWith(".tsx") ||
              f.endsWith(".ts") ||
              f.endsWith(".jsx") ||
              f.endsWith(".js"))
          );
        });

        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }

        files.forEach((file) => {
          const src = path.join(srcPath, file);
          const dest = path.join(destPath, file);
          fs.copyFileSync(src, dest);
        });
        console.log(
          `✓ [${index + 1}/${copies.length}] ${copy.name} - ${files.length} files copied`
        );
      } else {
        copyRecursive(srcPath, destPath);
        console.log(`✓ [${index + 1}/${copies.length}] ${copy.name} copied`);
      }
    } catch (err) {
      console.error(
        `✗ [${index + 1}/${copies.length}] ${copy.name} - Error: ${err.message}`
      );
    }
  } else {
    console.log(
      `⚠ [${index + 1}/${copies.length}] ${copy.name} - Source not found: ${srcPath}`
    );
  }
});

console.log("\n✅ Nurse Space Replacement Complete!");
