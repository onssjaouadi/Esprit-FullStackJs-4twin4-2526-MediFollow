const https = require("https");
const fs = require("fs");
const path = require("path");

// Créer le dossier fonts s'il n'existe pas
const fontsDir = path.join(__dirname, "..", "public", "fonts");
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// URL de la police Helvetiker Bold en format typeface.json
const fontUrl =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json";
const fontPath = path.join(fontsDir, "helvetiker_bold.typeface.json");

console.log("📥 Téléchargement de la police 3D Helvetiker Bold...");

https
  .get(fontUrl, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(fontPath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        console.log("✅ Police téléchargée avec succès !");
        console.log(`📁 Emplacement: ${fontPath}`);
      });
    } else {
      console.error(`❌ Erreur: ${response.statusCode}`);
    }
  })
  .on("error", (err) => {
    console.error("❌ Erreur de téléchargement:", err.message);
  });
