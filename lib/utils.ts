/**
 * Helper to download a file from a URL as a blob
 * This ensures the browser triggers a download instead of just opening in a tab
 */
export async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab if blob fetch fails
    window.open(url, '_blank');
    return false;
  }
}
