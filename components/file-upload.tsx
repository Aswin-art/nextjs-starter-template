"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Cropper, { Area } from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import {
  X,
  UploadCloud,
  Loader2,
  Crop as CropIcon,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { getCroppedImg } from "@/lib/canvas";
import {
  compressImage,
  formatFileSize,
  type CompressOptions,
} from "@/helpers/compress";

interface BaseProps {
  disabled?: boolean;
  onUpload: (file: File) => Promise<string>;
  aspectRatio?: number;
  compressionOptions?: CompressOptions;
}

interface SingleUploadProps extends BaseProps {
  multiple?: false;
  value?: string;
  onChange: (value: string) => void;
}

interface MultipleUploadProps extends BaseProps {
  multiple: true;
  value?: string[];
  onChange: (value: string[]) => void;
}

type FileUploadProps = SingleUploadProps | MultipleUploadProps;

export default function FileUpload(props: FileUploadProps) {
  const {
    onChange,
    value,
    disabled = false,
    onUpload,
    aspectRatio = 1,
    multiple = false,
    compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920 },
  } = props;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progressText, setProgressText] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (multiple) {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        setProgressText("Mengompres gambar...");

        try {
          const compressedFiles = await Promise.all(
            acceptedFiles.map(async (file) => {
              try {
                const result = await compressImage(file, compressionOptions);
                console.log(
                  `Compressed ${file.name}: ${formatFileSize(
                    result.originalSize,
                  )} -> ${formatFileSize(result.compressedSize)}`,
                );
                return result.file;
              } catch (error) {
                console.error(
                  `Gagal compress ${file.name}, menggunakan file asli`,
                  error,
                );
                return file;
              }
            }),
          );

          setProgressText("Mengupload...");

          const uploadPromises = compressedFiles.map((file) => onUpload(file));
          const newUrls = await Promise.all(uploadPromises);

          const currentValues = Array.isArray(value) ? value : [];
          (onChange as (v: string[]) => void)([...currentValues, ...newUrls]);

          toast.success(`${newUrls.length} gambar berhasil diupload`);
        } catch (error) {
          console.error(error);
          toast.error("Gagal mengupload beberapa gambar");
        } finally {
          setIsUploading(false);
          setProgressText("");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setImageSrc(url);
      }
    },
    [multiple, onUpload, onChange, value, compressionOptions],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: multiple ? 0 : 1,
    multiple: multiple,
    disabled: disabled || isUploading,
  });

  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    setProgressText("Memproses gambar...");

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Gagal memproses gambar");

      const croppedFile = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      setProgressText("Mengoptimasi ukuran...");
      const compressedResult = await compressImage(
        croppedFile,
        compressionOptions,
      );

      console.log(
        `Optimization: ${formatFileSize(
          compressedResult.originalSize,
        )} -> ${formatFileSize(compressedResult.compressedSize)}`,
      );

      setProgressText("Mengupload...");
      const uploadedUrl = await onUpload(compressedResult.file);

      if (!multiple) {
        (onChange as (v: string) => void)(uploadedUrl);
      }

      handleClose();
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengupload gambar");
    } finally {
      setIsUploading(false);
      setProgressText("");
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setZoom(1);
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter((url) => url !== urlToRemove);
      (onChange as (v: string[]) => void)(newValue);
    } else {
      (onChange as (v: string) => void)("");
    }
  };

  if (multiple && Array.isArray(value) && value.length > 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-md overflow-hidden border group bg-muted"
            >
              <Image src={url} alt="Uploaded" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  type="button"
                  onClick={() => handleRemove(url)}
                  disabled={disabled}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            flex flex-col items-center justify-center gap-2 h-[120px]
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:bg-muted/50"
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }
          `}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-6 h-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? progressText : "Tambah gambar lagi"}
          </p>
        </div>
      </div>
    );
  }

  if (!multiple && typeof value === "string" && value) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/10">
        <div className="relative w-full h-[300px] overflow-hidden rounded-md border bg-background flex items-center justify-center">
          <Image
            src={value}
            alt="Uploaded image"
            className="object-contain"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        {!disabled && (
          <Button
            variant="destructive"
            size="sm"
            type="button"
            className="mt-4"
            onClick={() => handleRemove(value)}
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-2" /> Hapus Gambar
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
          flex flex-col items-center justify-center gap-2 h-[220px]
          ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:bg-muted/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="p-4 rounded-full bg-muted shadow-sm">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          {isUploading ? (
            <p className="font-medium text-primary">{progressText}</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop atau klik untuk upload</p>
              <p className="text-xs text-muted-foreground">
                {multiple
                  ? "Mode: Multiple Upload (Auto Compress)"
                  : "Mode: Single Upload (Crop & Compress)"}
              </p>
            </>
          )}
        </div>
      </div>

      {!multiple && (
        <Dialog
          open={!!imageSrc}
          onOpenChange={(open) => !open && handleClose()}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CropIcon className="w-5 h-5" /> Edit & Optimasi
              </DialogTitle>
            </DialogHeader>

            <div className="relative w-full h-[400px] bg-black rounded-md overflow-hidden ring-1 ring-border">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            <div className="py-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Zoom Level</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(vals) => setZoom(vals[0])}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Batal
              </Button>
              <Button onClick={handleCropAndUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    {progressText}
                  </>
                ) : (
                  "Simpan & Upload"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
