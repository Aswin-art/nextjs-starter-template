import imageCompression from "browser-image-compression";

export interface CompressOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  useWebWorker?: boolean;
  preserveExif?: boolean;
  fileType?: "image/jpeg" | "image/png" | "image/webp";
  initialQuality?: number;
  onProgress?: (progress: number) => void;
}

interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasSkipped: boolean;
}

const DEFAULT_OPTIONS = {
  maxWidthOrHeight: 1920,
  maxSizeMB: 1,
  useWebWorker: true,
  preserveExif: false,
  initialQuality: 0.8,
} as const;

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const { onProgress, ...compressionOptions } = options;
  const mergedOptions = { ...DEFAULT_OPTIONS, ...compressionOptions };
  const originalSize = file.size;

  try {
    const compressedFile = await imageCompression(file, {
      ...mergedOptions,
      onProgress,
    });

    const compressedSize = compressedFile.size;

    const isFormatForced = options.fileType && options.fileType !== file.type;
    const isInefficient = compressedSize >= originalSize;

    if (isInefficient && !isFormatForced) {
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        wasSkipped: true,
      };
    }

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: compressedSize / originalSize,
      wasSkipped: false,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown compression error";
    throw new Error(`Image compression failed: ${message}`);
  }
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${units[i]}`;
}

export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap !== "undefined") {
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      return { width, height };
    } catch (e) {
      console.warn("Bitmap failed, trying fallback", e);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image dimensions"));
    };
    img.src = url;
  });
}
