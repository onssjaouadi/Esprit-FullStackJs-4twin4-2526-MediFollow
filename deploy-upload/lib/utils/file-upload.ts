/**
 * File upload utility for Azure Blob Storage
 */

// Map upload categories to valid DocumentCategory enum values
const CATEGORY_MAP: { [key: string]: string } = {
  "analysis-requests": "ANALYSIS",
  "analysis-responses": "REPORT",
  "medical-documents": "OTHER",
};

function mapCategory(category: string): string {
  return CATEGORY_MAP[category] || "OTHER";
}

export async function uploadFileToAzure(
  file: File,
  category: string = "medical-documents"
): Promise<{ url: string; name: string } | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    // Map the category to a valid enum value
    formData.append("category", mapCategory(category));

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Upload error:", error);
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    return {
      url: data.data.fileUrl,
      name: file.name,
    };
  } catch (error) {
    console.error("File upload error:", error);
    alert(
      `Erreur d'upload: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return null;
  }
}
