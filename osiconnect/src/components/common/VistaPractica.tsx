"use client";

import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";

interface Props {
  json: string | object;
}

export default function VistaPractica({ json }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
  if (editorRef.current) return; // 🔒 Evita doble inicialización

  const data = typeof json === "string" ? JSON.parse(json) : json;

  if (!holderRef.current) return;

  holderRef.current.replaceChildren();

  const editor = new EditorJS({
    holder: holderRef.current,
    readOnly: true,
    data,
    tools: {
      header: Header,
      list: List,
      image: ImageTool,
    },
  });

  console.log("Editor montado");
  editorRef.current = editor;

  return () => {
    editorRef.current?.destroy?.();
    editorRef.current = null;
  };
}, []);


  return (
    <div
      ref={holderRef}
      className="bg-background rounded border p-4 min-h-[300px] editorjs-render"
    />
  );
}
