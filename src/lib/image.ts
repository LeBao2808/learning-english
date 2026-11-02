import type { ChatImage } from "./types";

const MAX_SIDE = 1280;

/** Downscales an image to JPEG so uploads stay small and fast to send. */
export async function blobToChatImage(blob: Blob): Promise<ChatImage> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", data: dataUrl.slice(dataUrl.indexOf(",") + 1) };
}

export async function fetchRandomPhoto(): Promise<ChatImage> {
  const res = await fetch(`https://picsum.photos/1024/768?random=${Date.now()}`);
  if (!res.ok) throw new Error("Không tải được ảnh ngẫu nhiên");
  return blobToChatImage(await res.blob());
}

export function chatImageSrc(image: ChatImage): string {
  return `data:${image.mediaType};base64,${image.data}`;
}
