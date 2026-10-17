"use client";
import Editor, { loader, type Monaco, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useTheme } from "@/components/ThemeToggle";

// Serve Monaco from /public so it works without internet access.
loader.config({ paths: { vs: "/monaco/vs" } });

type Props = {
  value: string;
  language: string;
  onChange: (v: string) => void;
  fontSize: number;
  readOnly?: boolean;
  breakpoints: Set<number>;
  onToggleBreakpoint: (line: number) => void;
  currentLine?: number | null;
  errorLine?: number | null;
  onRun?: () => void;
  onSubmit?: () => void;
};

function defineThemes(monaco: Monaco) {
  monaco.editor.defineTheme("cc-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#131821",
      "editor.lineHighlightBackground": "#1b2230",
      "editorGutter.background": "#131821",
      "editorLineNumber.foreground": "#4b5567",
      "editorLineNumber.activeForeground": "#9aa4b5",
    },
  });
  monaco.editor.defineTheme("cc-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: { "editor.background": "#ffffff", "editor.lineHighlightBackground": "#f3f5f8" },
  });
}

export default function CodeEditor(props: Props) {
  const theme = useTheme();
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decoRef = useRef<MonacoEditor.IEditorDecorationsCollection | null>(null);
  const cbRef = useRef(props);
  cbRef.current = props;

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decoRef.current = editor.createDecorationsCollection([]);
    editor.onMouseDown((e) => {
      const t = e.target.type;
      if (
        (t === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN || t === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) &&
        e.target.position
      ) {
        cbRef.current.onToggleBreakpoint(e.target.position.lineNumber);
      }
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => cbRef.current.onSubmit?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote, () => cbRef.current.onRun?.());
    paint();
  };

  function paint() {
    const monaco = monacoRef.current;
    if (!monaco || !decoRef.current) return;
    const decos: MonacoEditor.IModelDeltaDecoration[] = [];
    for (const line of cbRef.current.breakpoints) {
      decos.push({
        range: new monaco.Range(line, 1, line, 1),
        options: { glyphMarginClassName: "cc-breakpoint-glyph", glyphMarginHoverMessage: { value: "Breakpoint (click to remove)" } },
      });
    }
    const cur = cbRef.current.currentLine;
    if (cur) {
      decos.push({
        range: new monaco.Range(cur, 1, cur, 1),
        options: { isWholeLine: true, className: "cc-current-line", linesDecorationsClassName: "cc-current-glyph" },
      });
    }
    const err = cbRef.current.errorLine;
    if (err) decos.push({ range: new monaco.Range(err, 1, err, 1), options: { isWholeLine: true, className: "cc-error-line" } });
    decoRef.current.set(decos);
    if (cur) editorRef.current?.revealLineInCenterIfOutsideViewport(cur);
  }

  useEffect(paint, [props.breakpoints, props.currentLine, props.errorLine]);

  return (
    <Editor
      height="100%"
      language={props.language}
      value={props.value}
      theme={theme === "dark" ? "cc-dark" : "cc-light"}
      beforeMount={defineThemes}
      onMount={onMount}
      onChange={(v) => props.onChange(v ?? "")}
      loading={<div className="p-4 text-sm text-muted">Loading editor…</div>}
      options={{
        fontSize: props.fontSize,
        fontFamily: "var(--font-jetbrains), monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        glyphMargin: true,
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        readOnly: props.readOnly,
        tabSize: 4,
        insertSpaces: true,
        automaticLayout: true,
        renderLineHighlight: props.readOnly ? "none" : "line",
        padding: { top: 12, bottom: 12 },
        smoothScrolling: true,
        cursorBlinking: "smooth",
        bracketPairColorization: { enabled: true },
        stickyScroll: { enabled: false },
        suggest: { showWords: true },
        quickSuggestions: { other: true, comments: false, strings: false },
      }}
    />
  );
}
