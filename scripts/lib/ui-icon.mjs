import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/ui-icon-assets-20261010.json", import.meta.url), "utf8"));
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);

// Exact Google outlines at FILL 0 / wght 300 / GRAD 0. SVG rendering keeps
// icons present with scripts/fonts blocked and cannot expose ligature text.
export const uiIconData = Object.fromEntries(manifest.glyphs.map((name) => [name,
  Object.fromEntries([20,24].map((size) => {
    const file = manifest.files.find((f) => f.name === name && f.opsz === size);
    const svg = readFileSync(new URL("../../" + file.path, import.meta.url), "utf8");
    const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
    const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*\/?\s*>/g)].map((match) => match[1]);
    if (!viewBox || !paths.length || /<(?:script|image|foreignObject|use)\b/.test(svg)) throw new Error(`Invalid official icon asset: ${file.path}`);
    return [size, {viewBox, paths}];
  }))
]));

export function uiIcon(name, { size = 24, className = "" } = {}) {
  if (!Object.hasOwn(uiIconData, name)) throw new Error(`Unsupported UI icon: ${name}`);
  if (!Number.isFinite(size) || size < 16 || size > 64) throw new Error("UI icon size must be between 16 and 64");
  const glyph = uiIconData[name][size <= 20 ? 20 : 24];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${glyph.viewBox}" fill="currentColor" aria-hidden="true" focusable="false" class="cm-ui-icon${className ? " " + escape(className) : ""}" data-ui-icon="${name}" data-ui-fill="0" data-ui-weight="300">${glyph.paths.map((d) => `<path d="${d}"></path>`).join("")}</svg>`;
}

export function uiIconHead(assetBase = "./") {
  return `<link rel="stylesheet" href="${escape(assetBase)}assets/ui-icons-current-r1.css">`;
}
