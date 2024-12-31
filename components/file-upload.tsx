"use client";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";

type Props = {
  apiEndpoint: "imageUploader";
  onChange: (url?: string) => void;
  value?: string;
  disabled?: boolean;
};

const FileUpload = ({
  apiEndpoint,
  onChange,
  value,
  disabled = false
}: Props) => {
  const { toast } = useToast();
  if (value) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-full h-[500px]">
          <Image
            src={value}
            alt="uploaded image"
            className="object-contain"
            fill
          />
        </div>

        {!disabled && (
          <Button variant={"ghost"} type="button" onClick={() => onChange("")}>
            <X className="w-4 h-4" /> Remove
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="w-full bg-muted/30">
      <UploadDropzone
        endpoint={apiEndpoint}
        onClientUploadComplete={(res) => {
          onChange(res[0].url);
        }}
        onUploadError={(error: Error) => {
          toast({
            title: "Error" + error.name,
            description: error.message
          });
        }}
      />
    </div>
  );
};

export default FileUpload;
