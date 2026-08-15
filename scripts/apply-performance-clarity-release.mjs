import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releaseReceipt = "2026-08-15-performance-clarity-v16";
const transcriptBeats = {
  th: [
    {
      start: 0,
      kicker: "ประชากรจดทะเบียน",
      title: "โครงสร้างอายุ เพศ และความหนาแน่นประชากร",
      note: "ประชากรจดทะเบียนไม่ใช่ประชากรกลางวัน ผู้อยู่อาศัยจริง หรือข้อมูลสด"
    },
    {
      start: 3.15,
      kicker: "อาคาร 3 มิติที่สวนพลู",
      title: "พื้นที่อาคารรวม จำนวนอาคาร ความสูง และจำนวนชั้น",
      note: "Open Buildings ไม่ใช่ทะเบียนอาคารและอาจไม่ครอบคลุมทุกสิ่งปลูกสร้าง"
    },
    {
      start: 6.3,
      kicker: "รายได้องค์กรปกครองส่วนท้องถิ่น",
      title: "เปรียบเทียบแหล่งรายได้ รายได้ต่อคน และรายได้ต่อพื้นที่",
      note: "รายได้เพียงอย่างเดียวไม่ใช่คุณภาพบริการหรือสุขภาพการคลัง"
    },
    {
      start: 9.45,
      kicker: "อุปสงค์การท่องเที่ยว",
      title: "ผู้เยี่ยมเยือน การใช้จ่าย ฤดูกาล และการเปรียบเทียบจังหวัด",
      note: "จำนวนผู้เยี่ยมเยือนไม่ใช่จำนวนบุคคลไม่ซ้ำ และตัวเลขอาจมีการปรับปรุง"
    }
  ],
  en: [
    {
      start: 0,
      kicker: "Registered population",
      title: "Age, sex and population-density structure",
      note: "Registered population is not daytime, resident or live population"
    },
    {
      start: 3.15,
      kicker: "3D buildings in Suan Plu",
      title: "Gross floor area, building count, height and floors",
      note: "Open Buildings is not a building register and may not cover every structure"
    },
    {
      start: 6.3,
      kicker: "Municipal revenue",
      title: "Revenue sources, revenue per person and revenue per area",
      note: "Revenue alone is not service quality or fiscal health"
    },
    {
      start: 9.45,
      kicker: "Tourism demand",
      title: "Visitors, spending, seasonality and province comparison",
      note: "Visitor counts are not unique people and figures may be revised"
    }
  ]
};

function replaceRequired(source, before, after, label) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) throw new Error(`${label}: expected exactly one match; found ${occurrences}`);
  return source.replace(before, after);
}

function compiledVideoBeats(beats) {
  return `videoBeats:[${beats.map((beat) => `{start:${beat.start},kicker:${JSON.stringify(beat.kicker)},title:${JSON.stringify(beat.title)},note:${JSON.stringify(beat.note)}}`).join(",")}]`;
}

function replaceCompiledVideoBeats(source, firstKicker, beats, label) {
  const start = source.indexOf(`videoBeats:[{start:0,kicker:${JSON.stringify(firstKicker)}`);
  const end = source.indexOf("]},featureProofs:", start);
  if (start < 0 || end < 0) throw new Error(`${label}: compiled video-beat boundary not found`);
  return source.slice(0, start) + compiledVideoBeats(beats) + source.slice(end + 1);
}

function transcriptHtml(language) {
  const muted = language === "th" ? "วิดีโอตัวอย่างไม่มีเสียง" : "The demo video has no sound";
  const items = transcriptBeats[language]
    .map((beat) => `<li>${beat.kicker}. ${beat.title}. ${beat.note}</li>`)
    .join("");
  return `<div id="demo-transcript" class="visually-hidden"><p>${muted}</p><ol>${items}</ol></div>`;
}

function buildMainBundle() {
  const sourcePath = join(root, "assets/index-qbT50gkr-v4.js");
  const targetPath = join(root, "assets/index-qbT50gkr-v5.js");
  let source = readFileSync(sourcePath, "utf8");

  source = replaceCompiledVideoBeats(source, "โจทย์ที่ทีมทำเลเจอทุกวัน", transcriptBeats.th, "Thai reel v3 transcript");
  source = replaceCompiledVideoBeats(source, "A question every location team faces", transcriptBeats.en, "English reel v3 transcript");

  const heroStart = source.indexOf("function U6({text:c})");
  const heroEnd = source.indexOf("function B6({text:c})", heroStart);
  if (heroStart < 0 || heroEnd < 0) throw new Error("Compiled hero component boundary not found");
  const heroComponent = 'function U6({text:c}){const f=r.useRef(null),[g,s]=r.useState(!1),[d,h]=r.useState(!1),[A,H]=r.useState(!1),[v,E]=r.useState(!1);r.useEffect(()=>{const O=window.matchMedia("(prefers-reduced-motion: reduce)"),ie=()=>{var Y;H(O.matches),h(!0),O.matches&&((Y=f.current)==null||Y.pause(),s(!1))};return E(new URLSearchParams(window.location.search).get("display")==="exhibition"),ie(),O.addEventListener("change",ie),()=>O.removeEventListener("change",ie)},[]),r.useEffect(()=>{!d||A||!f.current||f.current.play().catch(()=>s(!1))},[d,A]);function D(){const O=f.current;O&&(O.paused?(O.ended&&(O.currentTime=0),O.play().then(()=>s(!0)).catch(()=>s(!1))):(O.pause(),s(!1)))}return p.jsxs("figure",{className:"demo-figure",children:[p.jsxs("div",{className:"demo-video-shell",children:[d&&!A?p.jsx("video",{ref:f,muted:!0,loop:!0,playsInline:!0,autoPlay:!0,preload:"metadata",poster:ca("media/reel/citymeter-proof-v3-poster.webp"),"aria-label":c.hero.demoLabel,"aria-describedby":"demo-transcript",onPlay:()=>s(!0),onPause:()=>s(!1),children:p.jsx("source",{src:ca(v?"media/reel/citymeter-proof-v3-exhibition.mp4":"media/reel/citymeter-proof-v3.mp4"),type:"video/mp4"})}):p.jsx("img",{className:"demo-poster",src:ca("media/reel/citymeter-proof-v3-poster.webp"),alt:"",width:"1280",height:"720",fetchPriority:"high",decoding:"async"}),p.jsxs("span",{className:"live-example-label",children:[p.jsx("span",{"aria-hidden":"true"}),c.hero.demoLabel]}),d&&!A?p.jsx("button",{className:"playback-control",type:"button",onClick:D,"aria-label":g?c.accessibility.pauseDemo:c.accessibility.playDemo,children:g?p.jsx(o6,{size:22,weight:"bold"}):p.jsx(f6,{size:22,weight:"fill"})}):null]}),p.jsxs("div",{id:"demo-transcript",className:"visually-hidden",children:[p.jsx("p",{children:c.accessibility.demoMuted}),p.jsx("ol",{children:c.hero.videoBeats.map(O=>p.jsxs("li",{children:[O.kicker,". ",O.title,". ",O.note]},O.start))})]})]})}';
  source = source.slice(0, heroStart) + heroComponent + source.slice(heroEnd);

  source = replaceRequired(
    source,
    'p.jsx("img",{src:ca(s.previewPath),alt:"",width:"1200",height:"750"})',
    'p.jsx("img",{src:ca(s.previewPath),alt:"",width:"1200",height:"750",loading:"lazy",decoding:"async"})',
    "dataset preview loading contract"
  );
  source = replaceRequired(
    source,
    'width:"1200",height:"750",loading:d>1?"lazy":"eager"})',
    'width:"1200",height:"750",loading:"lazy",decoding:"async"})',
    "showcase preview loading contract"
  );
  source = replaceRequired(
    source,
    'className:"intent-proof-visual",children:[p.jsx("img",{src:ca(v.previewPath),alt:c==="th"?`ตัวอย่างหน้าจอ ${H.th}`:`${H.en} screen preview`,width:"1200",height:"750"})',
    'className:"intent-proof-visual",children:[p.jsx("img",{src:ca(v.previewPath),alt:c==="th"?`ตัวอย่างหน้าจอ ${H.th}`:`${H.en} screen preview`,width:"1200",height:"750",loading:"lazy",decoding:"async"})',
    "intent preview loading contract"
  );
  source = source.replaceAll('height:"750",loading:"lazy"})', 'height:"750",loading:"lazy",decoding:"async"})');

  if (source.includes('className:"demo-story-caption"') || source.includes('className:"demo-progress"') || source.includes('p.jsxs("figcaption",{children:[p.jsx("span",{children:c.hero.demoJourney})')) {
    throw new Error("Visible hero caption markup remains in the compiled bundle");
  }
  if (!source.includes('loading:"lazy",decoding:"async"') || !source.includes('preload:"metadata"')) {
    throw new Error("Compiled performance contracts were not applied");
  }

  writeFileSync(targetPath, source);
}

function buildEnhancementScript() {
  const sourcePath = join(root, "assets/catalog-enhancements.js");
  const targetPath = join(root, "assets/catalog-enhancements-v16.js");
  let source = readFileSync(sourcePath, "utf8");

  const retiredNarrativePattern = /      chapters: \[[\s\S]*?      caption: "[^"]*"\n/g;
  const retiredNarratives = source.match(retiredNarrativePattern) || [];
  if (retiredNarratives.length !== 2) throw new Error(`Expected two retired hero narrative blocks; found ${retiredNarratives.length}`);
  source = source.replace(retiredNarrativePattern, "");
  source = source.replace("  let heroTimer = null;\n  let heroVideo = null;\n", "");
  source = replaceRequired(
    source,
    `      card.querySelectorAll(".dataset-image img").forEach((image) => {\n        const url = new URL(image.src, document.baseURI);\n        if (url.searchParams.get("v") !== visualFocus.revision) {\n          url.searchParams.set("v", visualFocus.revision);\n          image.src = url.href;\n        }\n      });\n`,
    "",
    "preview cache-busting removal"
  );

  const chapterStart = source.indexOf("  function currentChapter(time) {");
  const chapterEnd = source.indexOf("  const supporterAssets = [", chapterStart);
  if (chapterStart < 0 || chapterEnd < 0) throw new Error("Legacy hero chapter runtime boundary not found");
  source = source.slice(0, chapterStart) + source.slice(chapterEnd);

  source = source.replace(
    '      if (placement === "footer") logo.loading = "lazy";',
    '      if (placement === "footer") logo.loading = "lazy";\n      else logo.fetchPriority = "low";'
  );

  const heroStart = source.indexOf("  function enhanceHero() {");
  const heroEnd = source.indexOf("  function enhanceFooterBranding() {", heroStart);
  if (heroStart < 0 || heroEnd < 0) throw new Error("Enhancement hero function boundary not found");
  const heroFunction = `  function enhanceHero() {
    const shell = document.querySelector(".demo-video-shell");
    if (!shell) return;
    shell.classList.add("is-catalog-enhanced");

    const legacyFrame = shell.querySelector(":scope > .demo-video-frame");
    if (legacyFrame) {
      while (legacyFrame.firstChild) shell.insertBefore(legacyFrame.firstChild, legacyFrame);
      legacyFrame.remove();
    }
    const legacyPanel = shell.querySelector(":scope > .demo-caption-panel");
    if (legacyPanel) {
      const retainedLabel = legacyPanel.querySelector(":scope > .live-example-label");
      if (retainedLabel) shell.insertBefore(retainedLabel, legacyPanel);
      legacyPanel.remove();
    }
    shell.querySelectorAll(".demo-story-caption, .demo-progress").forEach((node) => node.remove());
    shell.closest(".demo-figure")?.querySelector(":scope > figcaption")?.remove();

    const liveLabel = shell.querySelector(":scope > .live-example-label");
    if (liveLabel && liveLabel.dataset.contentVersion !== "4") {
      liveLabel.dataset.contentVersion = "4";
      const dot = liveLabel.querySelector("span");
      liveLabel.replaceChildren();
      if (dot) liveLabel.append(dot);
      liveLabel.append(document.createTextNode(text.realExample));
    }

    const video = shell.querySelector(":scope > video");
    if (video) {
      video.loop = true;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "metadata";
      if (video.dataset.catalogAutoplayTried !== "true") {
        video.dataset.catalogAutoplayTried = "true";
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches && video.paused) video.play().catch(() => {});
      }
    }

    const pageTitle = document.querySelector("#page-title");
    if (pageTitle) {
      if (pageTitle.textContent !== "CityMETER") pageTitle.textContent = "CityMETER";
      if (pageTitle.lang !== "en") pageTitle.lang = "en";
    }
    const citymeterLabel = document.querySelector(".citymeter-label");
    if (citymeterLabel && citymeterLabel.lang !== "en") citymeterLabel.lang = "en";

    const heroCopy = document.querySelector(".hero-copy");
    if (heroCopy) {
      heroCopy.querySelector(".supporter-lockup-hero")?.remove();
      let supporter = heroCopy.querySelector(".supporter-logos-hero");
      if (!supporter) supporter = createSupporterLogos("hero");
      const actions = heroCopy.querySelector(".hero-actions");
      if (actions && actions.nextElementSibling !== supporter) actions.after(supporter);
    }

    if (heroCopy && !heroCopy.querySelector(".hero-page-qr")) {
      const qrBlock = element("div", "hero-page-qr");
      const qr = document.createElement("img");
      qr.className = "hero-page-qr-image";
      qr.src = \`\${assetBase}media/qr/citymeter-page-\${language}.png\`;
      qr.alt = text.heroQrAlt;
      qr.width = 512;
      qr.height = 512;
      qr.loading = "lazy";
      qr.decoding = "async";
      qr.fetchPriority = "low";
      const copy = element("div", "hero-page-qr-copy");
      copy.append(element("strong", "", text.heroQrTitle));
      copy.append(element("span", "", text.heroQrHint));
      qrBlock.append(qr, copy);
      heroCopy.append(qrBlock);
    }

    const examplesIntro = document.querySelector("#examples .section-heading > p:last-child");
    if (examplesIntro && examplesIntro.textContent !== text.examplesIntro) examplesIntro.textContent = text.examplesIntro;
  }

`;
  source = source.slice(0, heroStart) + heroFunction + source.slice(heroEnd);

  const registryStart = `    const registryResult = fetch(\`${'${assetBase}'}data/catalog-source-review.json\`, { cache: "no-cache" }).then(async (response) => {\n      if (!response.ok) throw new Error(\`Source registry returned ${'${response.status}'}\`);\n      return { registry: await response.json() };\n    }).catch((error) => ({ error }));\n\n`;
  source = replaceRequired(source, registryStart, "", "early registry fetch removal");
  source = replaceRequired(
    source,
    "          const { registry, error } = await registryResult;",
    `          const registryResult = fetch(\`${'${assetBase}'}data/catalog-source-review.json?v=20260815-performance-clarity-v16\`, { cache: "force-cache" }).then(async (response) => {\n            if (!response.ok) throw new Error(\`Source registry returned ${'${response.status}'}\`);\n            return { registry: await response.json() };\n          }).catch((error) => ({ error }));\n          const { registry, error } = await registryResult;`,
    "deferred registry fetch"
  );

  for (const retired of ["renderHeroChapter", "heroTimer", "heroVideo", "video.load()", 'url.searchParams.set("v"']) {
    if (source.includes(retired)) throw new Error(`Retired runtime behavior remains: ${retired}`);
  }
  writeFileSync(targetPath, source);
}

function buildEnhancementStyles() {
  const sourcePath = join(root, "assets/catalog-enhancements-v15.css");
  const targetPath = join(root, "assets/catalog-enhancements-v16.css");
  let source = readFileSync(sourcePath, "utf8");

  source = source.replace(
    "/* CityMETER catalog source, quiet pillar surfaces, QR, responsive motion,\n   masonry and hero enhancement layer — 2026-08-15 */",
    "/* CityMETER performance, full-frame media and categorical pillar layer — 2026-08-15 */"
  );
  source = source.replace("--section-surface-showcase: #e2e9ed;", "--section-surface-showcase: #eef1ee;");
  source = source.replace("--section-surface-explorer: #f2f1df;", "--section-surface-explorer: #f6f7f3;");
  source = source.replace("--section-surface-showcase: #18333e;", "--section-surface-showcase: #172126;");
  source = source.replace("--section-surface-explorer: #2c2a22;", "--section-surface-explorer: #11191d;");

  source = source.replace(
    "  --pillar-surface-living: #e5e9e6;\n",
    "  --pillar-surface-living: #e5e9e6;\n  --pillar-accent-land: #846100;\n  --pillar-accent-location: #1f629b;\n  --pillar-accent-living: #007a58;\n  --pillar-accent-ink: #ffffff;\n"
  );
  source = source.replace(
    "  --pillar-border-default: #c9d0cb;\n",
    "  --pillar-border-default: #c9d0cb;\n  --pillar-border-emphasis: #7d877f;\n"
  );
  source = source.replace(
    "  --pillar-surface-living: #2b3534;\n",
    "  --pillar-surface-living: #2b3534;\n  --pillar-accent-land: #f4c44e;\n  --pillar-accent-location: #4c99d5;\n  --pillar-accent-living: #3bd19b;\n  --pillar-accent-ink: #182327;\n"
  );
  source = source.replace(
    "  --pillar-border-default: #46524f;\n",
    "  --pillar-border-default: #46524f;\n  --pillar-border-emphasis: #7c8a84;\n"
  );
  source = source.replace("  --border: var(--pillar-border-default);", "  --border: var(--pillar-border-emphasis);");
  source = source.replace("  background: var(--pillar-surface);\n}", "  background: var(--pillar-surface);\n  border-color: var(--border);\n  border-block-start: 5px solid var(--pillar-accent);\n}");
  source = source.replace(
    "  --pillar-surface: var(--pillar-surface-land);\n}",
    "  --pillar-surface: var(--pillar-surface-land);\n  --pillar-accent: var(--pillar-accent-land);\n}"
  );
  source = source.replace(
    "  --pillar-surface: var(--pillar-surface-location);\n}",
    "  --pillar-surface: var(--pillar-surface-location);\n  --pillar-accent: var(--pillar-accent-location);\n}"
  );
  source = source.replace(
    "  --pillar-surface: var(--pillar-surface-living);\n}",
    "  --pillar-surface: var(--pillar-surface-living);\n  --pillar-accent: var(--pillar-accent-living);\n}"
  );
  source = replaceRequired(
    source,
    ".dataset-card[data-pillar] .source-link,\n",
    `.dataset-card[data-pillar] .dataset-kicker > span:first-child,
.showcase-card[data-pillar] .record-group {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 26px;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--pillar-accent);
  color: var(--pillar-accent-ink);
  font-weight: 600;
}

.dataset-card[data-pillar] .source-link,
`,
    "pillar chip insertion"
  );

  const mobileHeroPattern = /  \.demo-video-shell\.is-catalog-enhanced \{[\s\S]*?  \.demo-video-shell\.is-catalog-enhanced \.demo-video-frame > \.playback-control \{[\s\S]*?\n  \}\n\n/;
  if (!mobileHeroPattern.test(source)) throw new Error("Legacy mobile hero panel CSS not found");
  source = source.replace(
    mobileHeroPattern,
    `  .demo-video-shell.is-catalog-enhanced {
    aspect-ratio: 16 / 9 !important;
    overflow: hidden !important;
    display: block !important;
    border-radius: 0;
    background: #05070a;
  }

  .demo-video-shell.is-catalog-enhanced > video,
  .demo-video-shell.is-catalog-enhanced > .demo-poster {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }

  .demo-video-shell.is-catalog-enhanced > .live-example-label {
    position: absolute !important;
    top: 10px !important;
    left: 10px !important;
    margin: 0 !important;
  }

  .demo-video-shell.is-catalog-enhanced > .playback-control {
    position: absolute !important;
    right: 11px !important;
    bottom: 10px !important;
    z-index: 5;
  }

`
  );

  writeFileSync(targetPath, source);
}

function updateHtml(page) {
  const path = join(root, page);
  let source = readFileSync(path, "utf8");
  source = source
    .replaceAll("index-qbT50gkr-v4.js", "index-qbT50gkr-v5.js")
    .replaceAll("catalog-enhancements-v15.css", "catalog-enhancements-v16.css")
    .replaceAll("catalog-enhancements.js?v=15", "catalog-enhancements-v16.js")
    .replaceAll("2026-08-15-pillar-card-surfaces", releaseReceipt)
    .replaceAll('loading="eager"', 'loading="lazy"')
    .replace(/loading="lazy"(?!\s+decoding="async")/g, 'loading="lazy" decoding="async"');

  source = source.replace(/<div class="demo-story-caption" aria-hidden="true">[\s\S]*?<\/div><div class="demo-progress" aria-hidden="true">[\s\S]*?<\/div>/, "");
  source = source.replace(/<figcaption>[\s\S]*?<\/figcaption><div id="demo-transcript"/, '<div id="demo-transcript"');
  const language = page === "index.html" ? "th" : "en";
  source = source.replace(/<div id="demo-transcript" class="visually-hidden">[\s\S]*?<\/ol><\/div>/, transcriptHtml(language));
  source = source.replace(
    /(<img class="demo-poster"[^>]*height="720")(\/>)/,
    '$1 fetchpriority="high" decoding="async"$2'
  );
  source = source.replace(/(<a class="dataset-image"[^>]*><img [^>]*?)(\/>)/g, (match, image, close) => {
    if (image.includes('loading="')) return match;
    return `${image} loading="lazy" decoding="async"${close}`;
  });
  source = source.replace(/(<div class="intent-proof-visual"><img [^>]*?)(\/>)/, (match, image, close) => {
    if (image.includes('loading="lazy"') && image.includes('decoding="async"')) return match;
    return `${image} loading="lazy" decoding="async"${close}`;
  });

  const datasetImages = source.match(/<a class="dataset-image"[^>]*><img [^>]*>/g) || [];
  if (datasetImages.length !== 38 || datasetImages.some((image) => !image.includes('loading="lazy"') || !image.includes('decoding="async"'))) {
    throw new Error(`${page}: dataset lazy-loading parity failed`);
  }
  const intentImage = source.match(/<div class="intent-proof-visual"><img [^>]*>/)?.[0] || "";
  if (!intentImage.includes('loading="lazy"') || !intentImage.includes('decoding="async"')) {
    throw new Error(`${page}: intent preview lazy-loading parity failed`);
  }
  for (const retired of ["demo-story-caption", "demo-progress"]) {
    if (source.includes(retired)) throw new Error(`${page}: retired visible hero content remains: ${retired}`);
  }
  if (!source.includes('id="demo-transcript" class="visually-hidden"')) throw new Error(`${page}: accessible hero transcript is missing`);
  const transcript = source.match(/<div id="demo-transcript" class="visually-hidden">[\s\S]*?<\/ol><\/div>/)?.[0] || "";
  if ((transcript.match(/<li>/g) || []).length !== 4 || !transcript.includes(transcriptBeats[language][3].title)) {
    throw new Error(`${page}: reel v3 transcript parity failed`);
  }

  writeFileSync(path, source);
}

buildMainBundle();
buildEnhancementScript();
buildEnhancementStyles();
updateHtml("index.html");
updateHtml("en/index.html");

console.log(`Applied CityMETER ${releaseReceipt}`);
