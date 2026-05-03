/**
 * Script pour mettre à jour les extensions de fichiers autorisées dans le bucket
 */

const sdk = require("node-appwrite");
require("dotenv").config();

const client = new sdk.Client();
const storage = new sdk.Storage(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
  .setProject(process.env.PROJECT_ID)
  .setKey(process.env.API_KEY);

const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID;

async function updateBucket() {
  console.log("🔧 Mise à jour du bucket de stockage...\n");

  try {
    // Mettre à jour le bucket pour autoriser toutes les extensions courantes
    const bucket = await storage.updateBucket(
      BUCKET_ID,
      "patient-documents",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
      false, // fileSecurity
      true, // enabled
      null, // maximumFileSize (unlimited)
      [] // allowedFileExtensions - vide = toutes les extensions autorisées
    );

    console.log("✅ Bucket mis à jour avec succès !");
    console.log(
      "📄 Toutes les extensions de fichiers sont maintenant autorisées"
    );
    console.log(
      "\n💡 Vous pouvez maintenant uploader n'importe quel type de document.\n"
    );
  } catch (error) {
    console.error("❌ Erreur:", error.message);

    // Méthode alternative : recréer le bucket
    console.log("\n⚠️  Si l'erreur persiste, allez sur la console Appwrite :");
    console.log(
      "https://cloud.appwrite.io/console/project-" +
        process.env.PROJECT_ID +
        "/storage/bucket-" +
        BUCKET_ID
    );
    console.log(
      "\nDans Settings > File extensions, laissez le champ VIDE ou ajoutez :"
    );
    console.log("png, jpg, jpeg, pdf, doc, docx, gif, bmp, txt\n");
  }
}

updateBucket();
