"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  compressImage,
  isImageFile,
  formatFileSize,
  type CompressOptions,
} from "@/helpers/compress";

interface ValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface ImageUploadState {
  file: File | null;
  compressedFile: File | null;
  preview: string | null;
  isCompressing: boolean;
  progress: number;
  error: string | null;
  originalSize: number;
  compressedSize: number;
  wasSkipped: boolean;
}

interface UseImageUploadOptions {
  compression?: CompressOptions;
  validation?: ValidationOptions;
  autoCompress?: boolean;
  generatePreview?: boolean;
}

interface UseImageUploadReturn extends ImageUploadState {
  handleFile: (file: File) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  reset: () => void;
  compress: () => Promise<void>;
}

const DEFAULT_VALIDATION: ValidationOptions = {
  maxSizeMB: 10,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

const INITIAL_STATE: ImageUploadState = {
  file: null,
  compressedFile: null,
  preview: null,
  isCompressing: false,
  progress: 0,
  error: null,
  originalSize: 0,
  compressedSize: 0,
  wasSkipped: false,
};

function validateFile(file: File, options: ValidationOptions): string | null {
  const { maxSizeMB, allowedTypes } = { ...DEFAULT_VALIDATION, ...options };

  if (!isImageFile(file)) {
    return "File must be an image";
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return `Allowed types: ${allowedTypes.join(", ")}`;
  }

  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return `File too large. Max: ${maxSizeMB}MB, Got: ${formatFileSize(
      file.size,
    )}`;
  }

  return null;
}

async function validateDimensions(
  file: File,
  options: ValidationOptions,
): Promise<string | null> {
  const { minWidth, minHeight, maxWidth, maxHeight } = options;

  if (!minWidth && !minHeight && !maxWidth && !maxHeight) {
    return null;
  }

  try {
    const { getImageDimensions } = await import("@/helpers/compress");
    const { width, height } = await getImageDimensions(file);

    if (minWidth && width < minWidth)
      return `Image width must be at least ${minWidth}px`;
    if (minHeight && height < minHeight)
      return `Image height must be at least ${minHeight}px`;
    if (maxWidth && width > maxWidth)
      return `Image width must be at most ${maxWidth}px`;
    if (maxHeight && height > maxHeight)
      return `Image height must be at most ${maxHeight}px`;
  } catch {
    return "Failed to read image dimensions";
  }

  return null;
}

export function useImageUpload(
  options: UseImageUploadOptions = {},
): UseImageUploadReturn {
  const {
    compression = {},
    validation = {},
    autoCompress = true,
    generatePreview = true,
  } = options;

  const [state, setState] = useState<ImageUploadState>(INITIAL_STATE);

  const previewUrlRef = useRef<string | null>(null);
  const compressionIdRef = useRef(0);

  const cleanupPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupPreview();
    };
  }, [cleanupPreview]);

  const reset = useCallback(() => {
    compressionIdRef.current += 1;
    cleanupPreview();
    setState(INITIAL_STATE);
  }, [cleanupPreview]);

  const runCompression = useCallback(
    async (file: File, sessionId: number) => {
      setState((s) => ({
        ...s,
        isCompressing: true,
        progress: 0,
        error: null,
      }));

      try {
        const result = await compressImage(file, {
          ...compression,
          onProgress: (progress) => {
            if (compressionIdRef.current === sessionId) {
              setState((s) => ({ ...s, progress }));
            }
          },
        });

        if (compressionIdRef.current !== sessionId) return;

        setState((s) => ({
          ...s,
          compressedFile: result.file,
          compressedSize: result.compressedSize,
          wasSkipped: result.wasSkipped,
          isCompressing: false,
          progress: 100,
        }));
      } catch (error) {
        if (compressionIdRef.current !== sessionId) return;

        setState((s) => ({
          ...s,
          isCompressing: false,
          error: error instanceof Error ? error.message : "Compression failed",
        }));
      }
    },
    [compression],
  );

  const compress = useCallback(async () => {
    if (!state.file) return;
    compressionIdRef.current += 1;
    await runCompression(state.file, compressionIdRef.current);
  }, [state.file, runCompression]);

  const handleFile = useCallback(
    async (file: File) => {
      compressionIdRef.current += 1;
      const sessionId = compressionIdRef.current;

      cleanupPreview();

      const validationError = validateFile(file, validation);
      if (validationError) {
        setState({ ...INITIAL_STATE, error: validationError });
        return;
      }

      const dimensionError = await validateDimensions(file, validation);
      if (dimensionError) {
        setState({ ...INITIAL_STATE, error: dimensionError });
        return;
      }

      let preview: string | null = null;
      if (generatePreview) {
        preview = URL.createObjectURL(file);
        previewUrlRef.current = preview;
      }

      setState({
        ...INITIAL_STATE,
        file,
        preview,
        originalSize: file.size,
      });

      if (autoCompress) {
        await runCompression(file, sessionId);
      }
    },
    [validation, autoCompress, generatePreview, cleanupPreview, runCompression],
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFile(file);
      }
    },
    [handleFile],
  );

  return {
    ...state,
    handleFile,
    handleInputChange,
    reset,
    compress,
  };
}

export type { ImageUploadState, UseImageUploadOptions, UseImageUploadReturn };
