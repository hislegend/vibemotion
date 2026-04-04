export async function uploadRenderedBlob(blob: Blob, filename: string): Promise<string> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  return url;
}
