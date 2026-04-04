"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Editor is heavy — lazy load
const EditorApp = dynamic(() => import("../../editor/editor").then(m => ({ default: m.Editor })), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0a", color: "#666", fontFamily: "Inter, system-ui" }}>
      <div>Loading Editor...</div>
    </div>
  ),
});

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorApp />
    </Suspense>
  );
}
