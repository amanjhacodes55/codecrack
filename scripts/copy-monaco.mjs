// Copies Monaco's AMD build into /public so the editor works offline (no CDN needed).
import { cpSync, existsSync, mkdirSync } from "node:fs";
const src = "node_modules/monaco-editor/min/vs";
const dest = "public/monaco/vs";
if (existsSync(src)) {
  mkdirSync("public/monaco", { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log("monaco copied to", dest);
}
