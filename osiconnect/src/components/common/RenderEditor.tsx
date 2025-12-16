"use client";

import { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Quote from '@editorjs/quote'
import Table from '@editorjs/table'
import Checklist from '@editorjs/checklist'
import Code from '@editorjs/code'


interface RenderEditorJSProps {
  htmlJson: OutputData;
}

export default function RenderEditorJS({ htmlJson }: RenderEditorJSProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!holderRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      data: htmlJson,
      readOnly: true,
      tools: {
        header: Header,
        list: List,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async () => ({ success: 0 }),
            },
          },
        },
        quote: Quote,
        table: Table,
        checklist: Checklist,
        code: Code,

      },
    });

    editorRef.current = editor;

    return () => {
      // ✅ Aseguramos que destroy exista antes de llamar
      if (
        editorRef.current &&
        typeof editorRef.current.destroy === "function"
      ) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [htmlJson]);

  return (
    <div
      ref={holderRef}
      className="prose dark:prose-invert max-w-none border rounded p-4 bg-background"
    />
  );
}
