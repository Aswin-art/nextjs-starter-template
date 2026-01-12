"use client";

import { useEffect, useRef } from "react";
import {
  useCreateBlockNote,
  FormattingToolbar,
  FormattingToolbarController,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton,
  BlockTypeSelect,
  FileCaptionButton,
  FileReplaceButton,
} from "@blocknote/react";
import { toast } from "sonner";

import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";

import { cn } from "@/lib/utils";
import { compressImage, formatFileSize, isImageFile } from "@/helpers/compress";

type EditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const EMPTY_DOCUMENT_HTML = "<p><br /></p>";

async function uploadFile(file: File): Promise<string> {
  if (!isImageFile(file)) {
    const error = "File harus berupa gambar (JPEG, PNG, WebP, GIF)";
    toast.error("Gagal Mengupload Gambar", {
      description: error,
    });
    throw new Error(error);
  }

  const startTime = Date.now();

  try {
    let fileToUpload = file;
    const originalSize = file.size;

    if (file.size > 1024 * 1024) {
      const result = await compressImage(file, {
        maxWidthOrHeight: 1200,
        maxSizeMB: 0.3,
        initialQuality: 0.8,
      });

      fileToUpload = result.file;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("scope", "news");

    const response = await fetch("/api/upload?scope=news", {
      method: "POST",
      body: formData,
    });

    const uploadTime = Date.now() - startTime;

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Upload gagal");
    }

    const sizeInfo =
      fileToUpload.size < originalSize
        ? `Ukuran: ${formatFileSize(originalSize)} → ${formatFileSize(
            fileToUpload.size,
          )}, Waktu: ${(uploadTime / 1000).toFixed(1)}s`
        : `Ukuran: ${formatFileSize(fileToUpload.size)}, Waktu: ${(
            uploadTime / 1000
          ).toFixed(1)}s`;

    toast.success("Gambar berhasil diunggah", {
      description: sizeInfo,
    });

    return result.url;
  } catch (error) {
    toast.error("Gagal mengunggah gambar", {
      description: (error as Error).message,
    });
    throw error;
  }
}

export function Editor({
  value,
  onChange,
  placeholder = "Tulis konten berita... (Ketik '/' untuk menu blok)",
  disabled = false,
  className,
}: EditorProps) {
  const initialHtmlRef = useRef(value);
  const lastAppliedHtmlRef = useRef(value ?? "");
  const isInitializedRef = useRef(false);

  const editor = useCreateBlockNote(
    {
      uploadFile,
    },
    [],
  );

  useEffect(() => {
    if (!editor || isInitializedRef.current) {
      return;
    }

    const initializeContent = async () => {
      const html = initialHtmlRef.current;
      if (html && html.trim().length > 0) {
        try {
          const parsedBlocks = await editor.tryParseHTMLToBlocks(html);
          editor.replaceBlocks(editor.document, parsedBlocks);
          lastAppliedHtmlRef.current = html;
        } catch (error) {
          console.warn(
            "[BlockNoteEditor] Failed to parse initial HTML content.",
            error,
          );
        }
      }
      isInitializedRef.current = true;
    };

    initializeContent();
  }, [editor]);

  useEffect(() => {
    if (!editor || !isInitializedRef.current) {
      return;
    }

    const nextHtml = value ?? "";
    if (nextHtml === lastAppliedHtmlRef.current) {
      return;
    }

    const syncContent = async () => {
      try {
        const parsedBlocks = await editor.tryParseHTMLToBlocks(
          nextHtml.trim().length > 0 ? nextHtml : EMPTY_DOCUMENT_HTML,
        );
        editor.replaceBlocks(editor.document, parsedBlocks);
        lastAppliedHtmlRef.current = nextHtml;
      } catch (error) {
        console.warn(
          "[BlockNoteEditor] Failed to apply external HTML value.",
          error,
        );
      }
    };

    syncContent();
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const unsubscribeSelection = editor.onSelectionChange((selection) => {});

    const unsubscribeContent = editor.onChange((instance) => {
      const html = instance.blocksToFullHTML(instance.document);

      lastAppliedHtmlRef.current = html;
      onChange(html);
    });

    return () => {
      unsubscribeSelection();
      unsubscribeContent();
    };
  }, [editor, onChange]);

  if (!editor) {
    return null;
  }

  return (
    <BlockNoteView
      theme={"light"}
      editor={editor}
      editable={!disabled}
      className={cn(className, "p-0 text-black")}
      formattingToolbar={false}
    >
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key={"blockTypeSelect"} />

            <FileCaptionButton key={"fileCaptionButton"} />
            <FileReplaceButton key={"fileReplaceButton"} />

            <BasicTextStyleButton
              basicTextStyle={"bold"}
              key={"boldStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"italic"}
              key={"italicStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"underline"}
              key={"underlineStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"strike"}
              key={"strikeStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"code"}
              key={"codeStyleButton"}
            />

            <TextAlignButton
              textAlignment={"left"}
              key={"textAlignLeftButton"}
            />
            <TextAlignButton
              textAlignment={"center"}
              key={"textAlignCenterButton"}
            />
            <TextAlignButton
              textAlignment={"right"}
              key={"textAlignRightButton"}
            />
            <TextAlignButton
              textAlignment={"justify"}
              key={"textAlignJustifyButton"}
            />

            <ColorStyleButton key={"colorStyleButton"} />

            <NestBlockButton key={"nestBlockButton"} />
            <UnnestBlockButton key={"unnestBlockButton"} />

            <CreateLinkButton key={"createLinkButton"} />
          </FormattingToolbar>
        )}
      />
    </BlockNoteView>
  );
}

export default Editor;
