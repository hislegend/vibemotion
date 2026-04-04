"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { codeToEditorState } from "../../editor/utils/code-to-timeline";

// Editor is heavy — lazy load
const EditorApp = dynamic(
  () => import("../../editor/editor").then((m) => ({ default: m.Editor })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#666",
          fontFamily: "Inter, system-ui",
        }}
      >
        <div>Loading Editor...</div>
      </div>
    ),
  },
);

export default function EditorPage() {
  const [initialCode, setInitialCode] = useState<string | null>(null);

  useEffect(() => {
    // URL 파라미터 또는 sessionStorage에서 AI 코드를 가져옴
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    if (codeParam) {
      setInitialCode(decodeURIComponent(codeParam));
      return;
    }

    // sessionStorage에서 generate 페이지가 넘긴 코드 확인
    const storedCode = sessionStorage.getItem("vibemotion-editor-code");
    if (storedCode) {
      setInitialCode(storedCode);
      sessionStorage.removeItem("vibemotion-editor-code");
    }
  }, []);

  useEffect(() => {
    if (initialCode) {
      // AI 코드를 파싱하여 에디터 초기 상태로 변환
      const { state, scenes } = codeToEditorState(initialCode);
      // 에디터 초기 상태를 localStorage에 저장 (context-provider가 로드)
      localStorage.setItem(
        "vibemotion-editor-state",
        JSON.stringify(state),
      );
      console.log(
        `[vibemotion] Loaded ${scenes.length} scenes into editor timeline`,
      );
    }
  }, [initialCode]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorApp />
    </Suspense>
  );
}
