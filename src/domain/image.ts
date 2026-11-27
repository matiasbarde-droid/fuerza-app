/**
 * Reduce una foto (cámara o galería) a un JPEG de máx. 1024 px antes de
 * guardarla en IndexedDB. Al redibujarla en un canvas también se eliminan
 * los metadatos EXIF (incluida la ubicación GPS de la foto).
 */
const MAX_SIDE = 1024;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen.');
  if (file.size > MAX_INPUT_BYTES) throw new Error('La imagen es demasiado grande (máx. 30 MB).');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.'))), 'image/jpeg', 0.82),
  );
}
