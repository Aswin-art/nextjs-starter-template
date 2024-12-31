"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { PartialBlock } from "@blocknote/core";

type Props = {
  onChange: (value?: string) => void;
  value?: string;
  editable?: boolean;
};

const EditableEditor = ({ onChange, value, editable = true }: Props) => {
  const [content, setContent] = useState<PartialBlock[]>();
  const editor = useCreateBlockNote({
    initialContent: content,
  });

  const { theme } = useTheme();
  const blockNoteTheme =
    theme === "light" || theme === "dark" ? theme : "light";

  const handleChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);

    if (html == undefined || html == "") {
      return;
    }

    onChange(html);
  };

  const parseData = async () => {
    const blocks = await editor.tryParseHTMLToBlocks(value ?? "");
    editor.replaceBlocks(editor.document, blocks);
    setContent(blocks);
  };

  useEffect(() => {
    parseData();
  }, []);

  return (
    <BlockNoteView
      editor={editor}
      theme={blockNoteTheme}
      onChange={handleChange}
      editable={editable}
    />
  );
};

export default EditableEditor;
