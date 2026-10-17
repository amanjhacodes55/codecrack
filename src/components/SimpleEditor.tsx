"use client";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeToggle";

loader.config({ paths: { vs: "/monaco/vs" } });

export default function SimpleEditor({ value, onChange, height = 260, language = "python" }: { value: string; onChange: (v: string) => void; height?: number; language?: string }) {
  const theme = useTheme();
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, tabSize: 4, automaticLayout: true, padding: { top: 8 } }}
      />
    </div>
  );
}
