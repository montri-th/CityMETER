import { readFileSync } from "node:fs";
import { uiIcon, uiIconData } from "./ui-icon.mjs";

// Explicit semantic mapping of the 19 retained Phosphor interface components.
// The immutable bundle remains untouched; the build changes component renderers.
export const retainedIconMap = {
  ArrowRightIcon: "arrow_forward", BuildingsIcon: "apartment",
  ChartLineUpIcon: "show_chart", CityIcon: "location_city", DatabaseIcon: "database",
  DesktopIcon: "desktop_windows", DeviceMobileIcon: "smartphone",
  GlobeHemisphereEastIcon: "public", MagnifyingGlassIcon: "search", MapPinIcon: "location_on",
  MapTrifoldIcon: "map", MoonIcon: "dark_mode", PauseIcon: "pause", PlayIcon: "play_arrow",
  ShareNetworkIcon: "share", ShieldCheckIcon: "shield", StorefrontIcon: "storefront",
  SunIcon: "light_mode", TranslateIcon: "translate",
};
const original = readFileSync(new URL("../../assets/index-qbT50gkr-v18.js", import.meta.url), "utf8");
const components = [...original.matchAll(/(\w+)=r\.forwardRef\(\(c,f\)=>r\.createElement\(ke,\{ref:f,\.\.\.c,weights:([\w$]+)\}\)\);\1\.displayName="([^"]+)"/g)]
  .filter((m) => retainedIconMap[m[3]]);
if (components.length !== Object.keys(retainedIconMap).length) throw new Error("Retained interface icon component inventory changed");
function mapExpression(weight) {
  const start = original.indexOf(weight + "=new Map(") + weight.length + 1;
  if (start < weight.length + 1) throw new Error(`Missing retained weight map ${weight}`);
  let depth=0, quote=null, escaped=false;
  for(let i=start;i<original.length;i++) {
    const c=original[i];
    if(quote){if(escaped)escaped=false;else if(c==="\\")escaped=true;else if(c===quote)quote=null;continue;}
    if(c==='"'||c==="'"){quote=c;continue;}
    if(c==='(')depth++;else if(c===')'&&--depth===0)return original.slice(start,i+1);
  }
  throw new Error(`Unclosed retained weight map ${weight}`);
}
const fakeReact = { Fragment:"fragment", createElement:(tag,props,...children)=>({tag,props,children}) };
const pathList = node => !node ? [] : [...(node.tag==='path'?[node.props.d]:[]),...(node.children||[]).flatMap(pathList)];
const fingerprints = new Map();
for (const component of components) {
  const weights = Function("r",`"use strict";return (${mapExpression(component[2])});`)(fakeReact);
  for(const node of weights.values()){
    const key=pathList(node).join("|");
    if(key)fingerprints.set(key,retainedIconMap[component[3]]);
  }
}
export function materializeUiIconsInHtml(html) {
  let result=html.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/g,(svg)=>{
    if(!/viewBox="0 0 256 256"/.test(svg))return svg; // Official identity/social artwork is separate.
    const key=[...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(m=>m[1]).join("|");
    const name=fingerprints.get(key);
    if(!name)throw new Error("Unmapped legacy interface SVG in initial HTML");
    const size=Number(/\bwidth="(\d+)"/.exec(svg)?.[1]||24);
    const className=/\bclass="([^"]*)"/.exec(svg)?.[1]||"";
    return uiIcon(name,{size,className});
  });
  result=result.replace(/(<span\b[^>]*class="[^"]*\blm-icon\b[^"]*"[^>]*>)([a-z_]+)(<\/span>)/g,(_,before,name,after)=>before+uiIcon(name,{size:22})+after);
  // Historic filled font files remain immutable but are not requested by this release.
  result=result.replace(/\s*<link\b[^>]*href="[^"]*material-symbols-rounded-citymeter-nav-(?:filled|outline)-r1\.ttf"[^>]*\/?\s*>/g,"");
  return result;
}

export function materializeUiIconsInBundle(bundle) {
  for(const component of components){
    const [needle,variable,,displayName]=component;
    if(bundle.split(needle).length!==2)throw new Error(`Expected one retained icon component: ${displayName}`);
    const replacement=`${variable}=r.forwardRef((c,f)=>CitymeterRoundedIcon(${JSON.stringify(retainedIconMap[displayName])},c,f));${variable}.displayName=${JSON.stringify(displayName)}`;
    bundle=bundle.replace(needle,()=>replacement);
  }
  // Exact same SVG tree/attributes as uiIcon() for hydration parity. Weight and
  // fill props from the historical component are intentionally not forwarded.
  const helper=`const CitymeterRoundedGlyphs=${JSON.stringify(uiIconData)};function CitymeterRoundedIcon(name,props={},ref){const {size=24,weight,color,mirrored,children,className="",...rest}=props;const glyph=CitymeterRoundedGlyphs[name][size<=20?20:24];return r.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:size,height:size,viewBox:glyph.viewBox,fill:"currentColor","aria-hidden":true,focusable:"false",...rest,className:"cm-ui-icon"+(className?" "+className:""),"data-ui-icon":name,"data-ui-fill":"0","data-ui-weight":"300",ref},...glyph.paths.map(d=>r.createElement("path",{d})));}\n`;
  const first=`const ${components[0][1]}=r.forwardRef(`;
  return bundle.replace(first,()=>helper+first);
}

export function materializeNavbarIcons(runtime) {
  const toggle='if (icon) icon.textContent = isOpen ? "close" : "menu";';
  if(runtime.split(toggle).length!==2)throw new Error("Navbar menu-icon toggle changed");
  runtime=runtime.replace(toggle,()=>`if (icon) icon.innerHTML = isOpen ? ${JSON.stringify(uiIcon("close",{size:22}))} : ${JSON.stringify(uiIcon("menu",{size:22}))};`);
  const active='if (icon) icon.classList.toggle("lm-icon--filled", active);';
  if(runtime.split(active).length!==2)throw new Error("Navbar selected-icon toggle changed");
  return runtime.replace(active,'if (icon) icon.classList.toggle("lm-icon--active", active);');
}
