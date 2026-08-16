import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releaseReceipt = "2026-08-16-motion-social-v22";
const previousReleaseReceipt = "2026-08-16-catalog-structure-simple-v21";
const sourceBundle = "index-qbT50gkr-v10.js";
const targetBundle = "index-qbT50gkr-v11.js";
const sourceCss = "catalog-enhancements-v19.css";
const targetCss = "catalog-enhancements-v20.css";
const sourceEnhancement = "catalog-enhancements-v17.js";
const targetEnhancement = "catalog-enhancements-v18.js";

const expectedHashes = {
  [sourceBundle]: "7946213bc8edefccf8ff2a2ca594903b548c51d11399dd0ea408295e71ab27ea",
  [sourceCss]: "e40c56eaf79c115349746c4ca721450342c5bba404e327e3882d25cb3ef7be95",
  [sourceEnhancement]: "8838d5e11340db1e6ce460e4f4e2190ae1fa27edcce358ba7a987b7014a2db4d"
};

const socialProfiles = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/landometer/",
    path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.438H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.969h-1.513c-1.491 0-1.956.931-1.956 1.887v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z"
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/landometer/",
    path: "M12 0C8.74 0 8.333.014 7.053.072 5.775.13 4.902.333 4.137.63a5.82 5.82 0 0 0-2.103 1.37A5.85 5.85 0 0 0 .665 4.1c-.297.765-.5 1.637-.558 2.913C.048 8.293.036 8.699.036 11.956s.015 3.663.072 4.943c.058 1.277.26 2.15.558 2.913a5.82 5.82 0 0 0 1.368 2.102 5.85 5.85 0 0 0 2.103 1.37c.765.297 1.637.5 2.915.558 1.28.058 1.686.072 4.943.072s3.663-.014 4.943-.072c1.278-.058 2.15-.26 2.913-.558a5.82 5.82 0 0 0 2.103-1.37 5.85 5.85 0 0 0 1.369-2.102c.297-.764.5-1.636.558-2.913.058-1.28.072-1.686.072-4.943s-.014-3.663-.072-4.943c-.058-1.277-.261-2.15-.558-2.913a5.82 5.82 0 0 0-1.369-2.102A5.85 5.85 0 0 0 19.852.63c-.764-.297-1.636-.5-2.913-.558C15.658.014 15.252 0 11.995 0Zm0 2.163c3.203 0 3.585.012 4.85.07 1.17.053 1.805.249 2.227.413.56.217.96.477 1.379.895.418.419.677.819.895 1.378.164.422.36 1.057.413 2.227.058 1.265.07 1.647.07 4.85s-.012 3.585-.07 4.85c-.053 1.17-.249 1.805-.413 2.227a3.7 3.7 0 0 1-.895 1.379 3.7 3.7 0 0 1-1.379.895c-.422.164-1.057.36-2.227.413-1.265.058-1.647.07-4.85.07s-3.585-.012-4.85-.07c-1.17-.053-1.805-.249-2.227-.413a3.7 3.7 0 0 1-1.379-.895 3.7 3.7 0 0 1-.895-1.379c-.164-.422-.36-1.057-.413-2.227-.058-1.265-.07-1.647-.07-4.85s.012-3.585.07-4.85c.053-1.17.249-1.805.413-2.227.217-.56.477-.96.895-1.378a3.7 3.7 0 0 1 1.379-.895c.422-.164 1.057-.36 2.227-.413 1.265-.058 1.647-.07 4.85-.07Zm0 3.675a6.158 6.158 0 1 0 0 12.316 6.158 6.158 0 0 0 0-12.316Zm0 10.153a3.995 3.995 0 1 1 0-7.99 3.995 3.995 0 0 1 0 7.99Zm7.842-10.396a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"
  },
  {
    name: "LinkedIn",
    url: "https://th.linkedin.com/company/landometer",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.94v5.666H9.351V9h3.414v1.561h.047c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@landometer82",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.59 3.17-5.93 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.72-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.45 3.98-2.14 6.15-1.74.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.11-.01 2.18-.66 2.76-1.6.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z"
  }
];

const footerComponent = `function SocialIconGlyph({path:c}){return p.jsx("svg",{"aria-hidden":"true",focusable:"false",viewBox:"0 0 24 24",children:p.jsx("path",{fill:"currentColor",d:c})})}function K6({text:c,language:f}){const g=f==="th"?"หน่วยงานและเครื่องหมายรับรองที่เกี่ยวข้อง":"Related programme and certification marks",s=f==="th"?"บัญชีบริการดิจิทัล":"Digital Service Account",d=f==="th"?"ช่องทางโซเชียลมีเดียของ Landometer":"Landometer social media",h=${JSON.stringify(socialProfiles)},A=N=>f==="th"?"Landometer บน "+N+" — เปิดในแท็บใหม่":"Landometer on "+N+" — opens in a new tab";return p.jsx("footer",{className:"site-footer",children:p.jsxs("div",{className:"wide-container footer-grid",children:[p.jsxs("div",{className:"footer-brand",children:[p.jsx(_f,{}),p.jsx("p",{children:c.footer.summary}),p.jsxs("div",{className:"supporter-logos supporter-logos-footer",role:"group","aria-label":g,children:[p.jsx("span",{className:"supporter-logo-cell supporter-logo-cell-depa",children:p.jsx("img",{className:"supporter-logo supporter-logo-depa",src:ca("media/supporters/depa.png"),alt:"depa",width:"2160",height:"1350",loading:"lazy",decoding:"async"})}),p.jsx("span",{className:"supporter-logo-cell supporter-logo-cell-dsure",children:p.jsx("img",{className:"supporter-logo supporter-logo-dsure",src:ca("media/supporters/dsure-software.png"),alt:"dSURE Software",width:"1014",height:"1465",loading:"lazy",decoding:"async"})}),p.jsx("span",{className:"supporter-logo-cell supporter-logo-cell-account",children:p.jsx("img",{className:"supporter-logo supporter-logo-account",src:ca("media/supporters/digital-service-account.png"),alt:s,width:"2298",height:"1042",loading:"lazy",decoding:"async"})})]})]}),p.jsxs("div",{className:"footer-meta",children:[p.jsxs("nav",{"aria-label":"Footer",children:[p.jsx("a",{href:"#datasets",children:c.footer.datasets}),p.jsx("a",{href:"https://landometer.com",target:"_blank",rel:"noreferrer",children:c.footer.contact}),p.jsx("a",{href:"#top",children:c.footer.backToTop})]}),p.jsx("nav",{className:"footer-social","aria-label":d,children:h.map(N=>p.jsx("a",{href:N.url,target:"_blank",rel:"noopener noreferrer","aria-label":A(N.name),title:N.name,children:p.jsx(SocialIconGlyph,{path:N.path})},N.name))}),p.jsx("small",{children:c.footer.copyright(new Date().getFullYear())})]})]})})}`;

const motionBlock = `  function cancelLayoutAnimations() {
    if (typeof document.getAnimations !== "function") return;
    document.getAnimations().forEach((animation) => {
      if (animation.id?.startsWith("citymeter-layout-") || animation.id === "citymeter-details-reveal" || animation.id === "citymeter-intent-reveal") animation.cancel();
    });
  }

  function captureCardLayout(control) {
    if (layoutMotionFrame) {
      cancelAnimationFrame(layoutMotionFrame);
      layoutMotionFrame = 0;
    }
    const sequence = ++layoutMotionSequence;
    const reason = control.matches(".dataset-details > summary")
      ? "details"
      : control.matches(".search-control input")
        ? "search"
        : control.matches(".intent-tab")
          ? "intent"
          : "filter";
    if (reducedMotion.matches || typeof Element.prototype.animate !== "function") {
      cancelLayoutAnimations();
      pendingLayoutMotion = null;
      document.documentElement.dataset.layoutMotion = "settled";
      globalThis.__CITYMETER_MOTION_DEBUG__ = {
        reason: "reduced-motion",
        sequence,
        movedCards: 0,
        enteredCards: 0,
        duration: 0,
        maxDelay: 0,
        reducedMotion: reducedMotion.matches,
        coarsePointer: coarsePointer.matches,
        startedAt: Date.now()
      };
      return;
    }
    const layoutEnabled = !coarsePointer.matches;
    const originRect = control.closest(".dataset-card")?.getBoundingClientRect() || control.getBoundingClientRect();
    const rects = layoutEnabled
      ? new Map(visibleDatasetCards().map((card) => [card.id, card.getBoundingClientRect()]))
      : new Map();
    cancelLayoutAnimations();
    pendingLayoutMotion = {
      control,
      reason,
      sequence,
      layoutEnabled,
      scrollX: globalThis.scrollX,
      scrollY: globalThis.scrollY,
      originX: originRect.left + originRect.width / 2,
      originY: originRect.top + originRect.height / 2,
      rects
    };
    document.documentElement.dataset.motionCaptured = reason;
    document.documentElement.dataset.motionSequence = String(sequence);
  }

  function revealOpenedDetails(details) {
    if (!details?.open || reducedMotion.matches || typeof Element.prototype.animate !== "function") return [];
    const animations = [];
    Array.from(details.children)
      .filter((child) => child.tagName !== "SUMMARY")
      .slice(0, 5)
      .forEach((child, index) => {
        const keyframes = coarsePointer.matches
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "translateY(0)" }];
        const animation = child.animate(keyframes, {
          duration: coarsePointer.matches ? 160 : 220,
          delay: coarsePointer.matches ? 0 : Math.min(index * 45, 180),
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards"
        });
        animation.id = "citymeter-details-reveal";
        animations.push(animation.finished.catch(() => {}));
      });
    return animations;
  }

  function revealIntentProof() {
    const proof = document.querySelector(".intent-proof");
    if (!proof || reducedMotion.matches || typeof Element.prototype.animate !== "function") return [];
    const animation = proof.animate(
      [{ opacity: .72, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 200, easing: "cubic-bezier(.16,1,.3,1)" }
    );
    animation.id = "citymeter-intent-reveal";
    return [animation.finished.catch(() => {})];
  }

  function animateCapturedLayout() {
    layoutMotionFrame = 0;
    const snapshot = pendingLayoutMotion;
    pendingLayoutMotion = null;
    if (!snapshot || reducedMotion.matches || snapshot.sequence !== layoutMotionSequence || typeof Element.prototype.animate !== "function") return;

    const animations = [];
    const viewportMargin = globalThis.innerHeight * .5;
    const isNearViewport = (rect) => rect.bottom >= -viewportMargin && rect.top <= globalThis.innerHeight + viewportMargin;
    const scrollChanged = Math.abs(globalThis.scrollX - snapshot.scrollX) > 4 || Math.abs(globalThis.scrollY - snapshot.scrollY) > 4;
    const moved = [];
    if (snapshot.layoutEnabled && !scrollChanged) {
      snapshot.rects.forEach((first, cardId) => {
        const card = document.getElementById(cardId);
        if (!card?.isConnected) return;
        const last = card.getBoundingClientRect();
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        if ((Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) || (!isNearViewport(first) && !isNearViewport(last))) return;
        moved.push({
          card,
          deltaX,
          deltaY,
          distance: Math.hypot(last.left + last.width / 2 - snapshot.originX, last.top + last.height / 2 - snapshot.originY)
        });
      });
    }
    moved.sort((a, b) => a.distance - b.distance);
    const stagger = snapshot.reason === "details" ? 28 : 18;
    const delayCap = snapshot.reason === "details" ? 168 : 108;
    moved.forEach(({ card, deltaX, deltaY }, index) => {
      const animation = card.animate(
        [{ transform: \`translate3d(\${deltaX}px, \${deltaY}px, 0)\` }, { transform: "translate3d(0, 0, 0)" }],
        {
          duration: 280,
          delay: Math.min(index * stagger, delayCap),
          easing: "cubic-bezier(.2,0,0,1)",
          fill: "backwards"
        }
      );
      animation.id = \`citymeter-layout-\${snapshot.reason}\`;
      animations.push(animation.finished.catch(() => {}));
    });

    let enteredCards = 0;
    if (snapshot.reason === "filter" || snapshot.reason === "search") {
      visibleDatasetCards()
        .filter((card) => !snapshot.rects.has(card.id) && isNearViewport(card.getBoundingClientRect()))
        .slice(0, 5)
        .forEach((card, index) => {
          const keyframes = coarsePointer.matches
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }];
          const animation = card.animate(keyframes, {
            duration: coarsePointer.matches ? 160 : 200,
            delay: Math.min(index * 35, 140),
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards"
          });
          animation.id = \`citymeter-layout-\${snapshot.reason}-enter\`;
          animations.push(animation.finished.catch(() => {}));
          enteredCards += 1;
        });
    }

    if (snapshot.reason === "details") animations.push(...revealOpenedDetails(snapshot.control.closest(".dataset-details")));
    if (snapshot.reason === "intent") animations.push(...revealIntentProof());

    const maxDelay = moved.length > 0 ? Math.min((moved.length - 1) * stagger, delayCap) : 0;
    document.documentElement.dataset.layoutMotion = animations.length ? "active" : "settled";
    document.documentElement.dataset.motionMoved = String(moved.length);
    document.documentElement.dataset.motionEntered = String(enteredCards);
    globalThis.__CITYMETER_MOTION_DEBUG__ = {
      reason: snapshot.reason,
      sequence: snapshot.sequence,
      movedCards: moved.length,
      enteredCards,
      duration: 280,
      maxDelay,
      totalDuration: 280 + maxDelay,
      reducedMotion: false,
      coarsePointer: coarsePointer.matches,
      abortedForScroll: scrollChanged,
      startedAt: Date.now()
    };
    Promise.allSettled(animations).then(() => {
      if (snapshot.sequence === layoutMotionSequence && document.documentElement.dataset.motionSequence === String(snapshot.sequence)) {
        document.documentElement.dataset.layoutMotion = "settled";
      }
    });
  }

  function scheduleCapturedLayout() {
    if (!pendingLayoutMotion) return;
    if (layoutMotionFrame) cancelAnimationFrame(layoutMotionFrame);
    if (pendingLayoutMotion.reason === "details") {
      layoutMotionFrame = requestAnimationFrame(animateCapturedLayout);
      return;
    }
    layoutMotionFrame = requestAnimationFrame(() => {
      layoutMotionFrame = requestAnimationFrame(animateCapturedLayout);
    });
  }

  function installResponsiveMotion() {
    if (motionInstalled) return;
    motionInstalled = true;
    const controlFromEvent = (event) => event.target instanceof Element
      ? event.target.closest(".dataset-details > summary, .group-filters button, .intent-tab")
      : null;
    document.addEventListener("pointerdown", (event) => {
      const control = controlFromEvent(event);
      if (control) captureCardLayout(control);
    }, true);
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const control = controlFromEvent(event);
      if (control) captureCardLayout(control);
    }, true);
    document.addEventListener("click", (event) => {
      const control = controlFromEvent(event);
      if (!control) return;
      if (!pendingLayoutMotion || pendingLayoutMotion.control !== control) captureCardLayout(control);
      scheduleCapturedLayout();
    }, true);
    document.addEventListener("input", (event) => {
      const control = event.target instanceof Element ? event.target.closest(".search-control input") : null;
      if (!control) return;
      captureCardLayout(control);
      scheduleCapturedLayout();
    }, true);
  }

`;

const socialCss = `
/* CityMETER interaction ripple and social footer — release v22. */
.explorer-section {
  overflow-x: clip;
}

.site-footer .footer-social {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  max-width: none;
}

.site-footer .footer-social a {
  width: 44px;
  height: 44px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 44px;
  border: 1px solid var(--pillar-border-default);
  border-radius: 50%;
  background: var(--pillar-surface-raised);
  color: var(--pillar-text-primary);
  text-decoration: none;
  transition: transform var(--motion-duration-feedback) var(--motion-ease-enter), border-color var(--motion-duration-feedback) ease, color var(--motion-duration-feedback) ease;
}

.site-footer .footer-social a:hover,
.site-footer .footer-social a:focus-visible {
  border-color: var(--pillar-interaction-accent);
  color: var(--pillar-interaction-accent);
  transform: translateY(-2px);
}

.site-footer .footer-social a:active {
  transform: translateY(0);
}

.site-footer .footer-social svg {
  width: 21px;
  height: 21px;
}

@media (max-width: 900px) {
  .site-footer .footer-social {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-footer .footer-social a:hover,
  .site-footer .footer-social a:focus-visible,
  .site-footer .footer-social a:active {
    transform: none;
  }
}
`;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readAsset(name) {
  return readFileSync(join(root, "assets", name), "utf8");
}

function assertImmutableSource(name, source) {
  assert(sha256(source) === expectedHashes[name], "Unexpected immutable source bytes: " + name);
}

function replaceDelimited(source, start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  assert(startIndex >= 0 && source.indexOf(start, startIndex + 1) === -1, label + " start marker must occur exactly once");
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(endIndex >= 0, label + " end marker is missing after its unique start marker");
  return source.slice(0, startIndex) + replacement + source.slice(endIndex);
}

function replaceOnce(source, oldValue, newValue, label) {
  const oldCount = source.split(oldValue).length - 1;
  assert(oldCount === 1, label + " must occur exactly once");
  return source.replace(oldValue, newValue);
}

function replaceActiveRef(source, oldValue, newValue, label) {
  const oldCount = source.split(oldValue).length - 1;
  const newCount = source.split(newValue).length - 1;
  assert((oldCount === 1 && newCount === 0) || (oldCount === 0 && newCount === 1), label + " must contain exactly one old or new value");
  return oldCount === 1 ? source.replace(oldValue, newValue) : source;
}

function socialNavMarkup(language) {
  const navLabel = language === "th" ? "ช่องทางโซเชียลมีเดียของ Landometer" : "Landometer social media";
  const links = socialProfiles.map((profile) => {
    const label = language === "th"
      ? `Landometer บน ${profile.name} — เปิดในแท็บใหม่`
      : `Landometer on ${profile.name} — opens in a new tab`;
    return `<a href="${profile.url}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${profile.name}"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="${profile.path}"></path></svg></a>`;
  }).join("");
  return `<nav class="footer-social" aria-label="${navLabel}">${links}</nav>`;
}

const sourceBundleText = readAsset(sourceBundle);
const sourceCssText = readAsset(sourceCss);
const sourceEnhancementText = readAsset(sourceEnhancement);
assertImmutableSource(sourceBundle, sourceBundleText);
assertImmutableSource(sourceCss, sourceCssText);
assertImmutableSource(sourceEnhancement, sourceEnhancementText);

const nextBundle = replaceDelimited(sourceBundleText, "function K6(", "function J6(", footerComponent, "Hydrated footer owner");
writeFileSync(join(root, "assets", targetBundle), nextBundle);

const nextCss = sourceCssText.trimEnd() + "\n" + socialCss.trim() + "\n";
writeFileSync(join(root, "assets", targetCss), nextCss);

let nextEnhancement = replaceOnce(
  sourceEnhancementText,
  "  let layoutMotionFrame = 0;",
  "  let layoutMotionFrame = 0;\n  let layoutMotionSequence = 0;",
  "Motion sequence owner"
);
nextEnhancement = replaceDelimited(
  nextEnhancement,
  "  function cancelLayoutAnimations()",
  "  function enhanceCard(card)",
  motionBlock,
  "Responsive motion owner"
);
writeFileSync(join(root, "assets", targetEnhancement), nextEnhancement);

for (const [page, language] of [["index.html", "th"], ["en/index.html", "en"]]) {
  const path = join(root, page);
  let html = readFileSync(path, "utf8");
  if (!html.includes('class="footer-social"')) {
    html = replaceOnce(html, "</nav><small>", `</nav>${socialNavMarkup(language)}<small>`, page + " social footer");
  } else {
    assert((html.match(/class="footer-social"/g) || []).length === 1, page + " must contain exactly one social footer");
  }
  html = replaceActiveRef(html, sourceBundle, targetBundle, page + " bundle ref");
  html = replaceActiveRef(html, sourceCss, targetCss, page + " CSS ref");
  html = replaceActiveRef(html, sourceEnhancement, targetEnhancement, page + " enhancement ref");
  html = replaceActiveRef(html, previousReleaseReceipt, releaseReceipt, page + " receipt");
  writeFileSync(path, html);
}

console.log("Applied " + releaseReceipt + " with immutable v11/v20/v18 assets.");
