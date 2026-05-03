const https = require("https");
const fs = require("fs");
const path = require("path");

// Créer le dossier models s'il n'existe pas
const modelsDir = path.join(__dirname, "..", "public", "models");
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log("✅ Dossier /public/models/ créé");
}

// URL d'un modèle de démonstration gratuit (example fox model)
// Remplacez par un vrai modèle anatomique de Sketchfab
const modelUrl =
  "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/fox-animated/model.gltf";
const outputPath = path.join(modelsDir, "demo-model.gltf");

console.log("📥 Téléchargement du modèle de démonstration...");
console.log("URL:", modelUrl);

const file = fs.createWriteStream(outputPath);

https
  .get(modelUrl, (response) => {
    if (response.statusCode === 200) {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        console.log("✅ Modèle téléchargé avec succès!");
        console.log("📁 Chemin:", outputPath);
        console.log("");
        console.log("🎯 PROCHAINES ÉTAPES:");
        console.log("1. Téléchargez un vrai modèle anatomique depuis:");
        console.log(
          "   https://sketchfab.com/3d-models?features=downloadable&q=human+anatomy"
        );
        console.log("");
        console.log('2. Renommez-le en "human-body.glb"');
        console.log("");
        console.log("3. Placez-le dans: public/models/human-body.glb");
        console.log("");
        console.log(
          "4. Utilisez le composant HumanBody3DModel dans votre code"
        );
        console.log("");
        console.log("📖 Voir docs/3D_MODELS_GUIDE.md pour plus d'infos");
      });
    } else {
      console.error("❌ Erreur lors du téléchargement:", response.statusCode);
      console.log("");
      console.log("⚠️  Pas de problème! Téléchargez manuellement depuis:");
      console.log(
        "   https://sketchfab.com/3d-models?features=downloadable&q=human+anatomy"
      );
    }
  })
  .on("error", (err) => {
    fs.unlink(outputPath, () => {});
    console.error("❌ Erreur:", err.message);
    console.log("");
    console.log("💡 Solutions:");
    console.log("1. Vérifiez votre connexion internet");
    console.log("2. Téléchargez manuellement un modèle depuis Sketchfab");
    console.log("3. Consultez le guide: docs/3D_MODELS_GUIDE.md");
  });
