/**
 * Convert Azure Blob URL to our proxy download URL
 */
export function getBlobDownloadUrl(blobUrl: string, fileName: string): string {
  if (!blobUrl) {
    console.error("❌ No blob URL provided");
    return "";
  }

  console.log("🔵 getBlobDownloadUrl input:", { blobUrl, fileName });

  try {
    const url = new URL(blobUrl);
    const pathname = url.pathname;
    console.log("📍 Pathname:", pathname);

    // pathname is like: /container/uploads/medical-documents/...
    const pathParts = pathname.substring(1).split("/"); // Remove leading /, then split

    if (pathParts.length < 2) {
      console.error("❌ Invalid pathname format:", pathname);
      return "";
    }

    // Skip container name, get the rest
    const blobPath = pathParts.slice(1).join("/");
    console.log("📍 Blob path:", blobPath);

    // Return proxy URL
    const downloadUrl = `/api/download/${blobPath}?fileName=${encodeURIComponent(fileName)}`;
    console.log("✅ Download URL:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("❌ Invalid blob URL:", blobUrl, error);
    return "";
  }
}
