/**
 * Reduce una imagen en el navegador antes de subirla (fotos del menú,
 * logo). Una foto de celular de 4–12 MB queda en unos cientos de KB: cuida
 * el 1 GB gratis de Storage y el límite de las Server Actions en Vercel.
 */
export async function shrinkImage(
  file: File,
  { maxSide, type, quality = 0.85 }: { maxSide: number; type: "image/jpeg" | "image/png"; quality?: number }
): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) throw new Error("No se pudo procesar la imagen");
  const extension = type === "image/png" ? "png" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${extension}`, { type });
}

/** Cambia el archivo de un `<input type="file">` y envía su formulario (así `SubmitOverlay` muestra el "guardando"). */
export function submitWithFile(input: HTMLInputElement, file: File) {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.form?.requestSubmit();
}
