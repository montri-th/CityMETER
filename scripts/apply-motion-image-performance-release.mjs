import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const releaseReceipt = "2026-08-16-motion-image-performance-v23";
const previousReleaseReceipt = "2026-08-16-motion-social-v22";
const sourceBundle = "index-qbT50gkr-v11.js";
const targetBundle = "index-qbT50gkr-v12.js";
const sourceCss = "catalog-enhancements-v20.css";
const targetCss = "catalog-enhancements-v21.css";
const sourceEnhancement = "catalog-enhancements-v18.js";
const targetEnhancement = "catalog-enhancements-v19.js";

const expectedHashes = {
  [sourceBundle]: "09a4e3dcf3048027692a08daae8cd5761fea23f924d7a9ed38a8f624403f9967",
  [sourceCss]: "a8e2af8c2896907e61c4a0c8750efbe630f6f10e334dbcc0cac45899a1203743",
  [sourceEnhancement]: "4ce3e722bf6c6e21e28db8f08a84fc05cbaeabcc0864a345c31987fac9215fb2",
};

const sourceDatasetImage = 'p.jsx("img",{src:ca(s.previewPath),alt:"",width:"1200",height:"750",loading:"lazy",decoding:"async"})';
const targetDatasetImage = 'p.jsx("img",{src:ca(s.previewPath.replace("media/previews-v2/","media/previews-v3/")),alt:"",width:"800",height:"500",loading:"lazy",decoding:"async"})';

const sourceHeroComponentStart = "function U6({text:c})";
const sourceHeroComponentEnd = "function B6({text:c})";
const targetHeroComponent = `function U6({text:c}){const f=r.useRef(null),[g,s]=r.useState(!1),[d,h]=r.useState(!1),[A,H]=r.useState(!1),[v,E]=r.useState(!1),[O,ie]=r.useState(!1),[Y,X]=r.useState(!1);r.useEffect(()=>{const Z=window.matchMedia("(prefers-reduced-motion: reduce)"),ee=navigator.connection||navigator.mozConnection||navigator.webkitConnection,M=()=>{var te;const ne=!!((te=ee)!=null&&te.saveData)||["slow-2g","2g"].includes(((ee==null?void 0:ee.effectiveType)||"").toLowerCase());ie(ne),H(Z.matches),h(!0),Z.matches&&((te=f.current)==null||te.pause(),s(!1))};return E(new URLSearchParams(window.location.search).get("display")==="exhibition"),M(),Z.addEventListener("change",M),ee==null||ee.addEventListener==null||ee.addEventListener("change",M),()=>{Z.removeEventListener("change",M),ee==null||ee.removeEventListener==null||ee.removeEventListener("change",M)}},[]),r.useEffect(()=>{if(!d||A||!f.current)return;const Z=f.current;if(typeof IntersectionObserver!=="function"){X(!0);return}const ee=new IntersectionObserver(M=>{const ne=!!M[0]?.isIntersecting;X(ne),ne||(Z.pause(),s(!1))},{rootMargin:"160px 0px",threshold:.12});return ee.observe(Z.closest(".demo-figure")||Z),()=>ee.disconnect()},[d,A]),r.useEffect(()=>{const Z=f.current;!d||A||!Z||(Y&&!O?Z.play().catch(()=>s(!1)):(Z.pause(),s(!1)))},[d,A,Y,O]);function D(){const Z=f.current;Z&&(Z.paused?(Z.ended&&(Z.currentTime=0),Z.play().then(()=>s(!0)).catch(()=>s(!1))):(Z.pause(),s(!1)))}return p.jsxs("figure",{className:"demo-figure",children:[p.jsxs("div",{className:"demo-video-shell",children:[d&&!A?p.jsx("video",{ref:f,muted:!0,loop:!0,playsInline:!0,preload:"metadata",poster:ca("media/reel/citymeter-proof-v3-poster.webp"),"aria-label":c.hero.demoLabel,"aria-describedby":"demo-transcript",onPlay:()=>s(!0),onPause:()=>s(!1),children:p.jsx("source",{src:ca(v?"media/reel/citymeter-proof-v3-exhibition.mp4":"media/reel/citymeter-proof-v3.mp4"),type:"video/mp4"})}):p.jsx("img",{className:"demo-poster",src:ca("media/reel/citymeter-proof-v3-poster.webp"),alt:"",width:"1280",height:"720",fetchPriority:"high",decoding:"async"}),p.jsxs("span",{className:"live-example-label",children:[p.jsx("span",{"aria-hidden":"true"}),c.hero.demoLabel]}),d&&!A?p.jsx("button",{className:"playback-control",type:"button",onClick:D,"aria-label":g?c.accessibility.pauseDemo:c.accessibility.playDemo,children:g?p.jsx(o6,{size:22,weight:"bold"}):p.jsx(f6,{size:22,weight:"fill"})}):null]}),p.jsxs("div",{id:"demo-transcript",className:"visually-hidden",children:[p.jsx("p",{children:c.accessibility.demoMuted}),p.jsx("ol",{children:c.hero.videoBeats.map(Z=>p.jsxs("li",{children:[Z.kicker,". ",Z.title,". ",Z.note]},Z.start))})]})]})}`;
const sourceHydrationTranscriptItem = 'p.jsxs("li",{children:[Z.kicker,". ",Z.title,". ",Z.note]},Z.start)';
const targetHydrationTranscriptItem = 'p.jsx("li",{children:Z.kicker+". "+Z.title+". "+Z.note},Z.start)';
const sourceUnsupportedIntersectionFallback = 'if(typeof IntersectionObserver!=="function"){X(!0);return}';
const targetUnsupportedIntersectionFallback = 'if(typeof IntersectionObserver!=="function"){X(!1);return}';
const sourceSchemaComponentStart = "function L6()";
const sourceSchemaComponentEnd = "function _f()";
const targetSchemaComponent = `function L6(){const c=typeof document<"u"?((document.querySelector('link[rel="canonical"]')?.href??"https://montri-th.github.io/CityMETER/").replace(/\\/en\\/?$/,"/")):"https://montri-th.github.io/CityMETER/",f={"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":c+"#page",url:c,name:"CityMETER — See the place before you decide",alternateName:"CityMETER — เห็นข้อมูลพื้นที่ก่อนตัดสินใจ",description:"A visual showcase of CityMETER implementations for land, location, business, people, services and risk decisions.",inLanguage:["th","en"],mainEntity:{"@id":c+"#catalog"}},{"@type":"DataCatalog","@id":c+"#catalog",name:"CityMETER public data views and modules",numberOfItems:Gl.length,dataset:Gl.map(g=>({"@type":"Dataset","@id":c+"#dataset-"+xn(g.id),url:c+"#dataset-"+xn(g.id),name:g.en,alternateName:g.th,description:g.marketing.visualStory.en+". "+g.marketing.limitation.en,inLanguage:["th","en"],spatialCoverage:g.marketing.evidencedScope.status==="unknown"?void 0:g.marketing.evidencedScope.en,subjectOf:{"@type":"WebPage",url:g.href,name:"Open "+g.en+" in CityMETER"}}))}]};return p.jsx("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:JSON.stringify(f)}})}`;

const sourceEnhancerHeroAutoplay = `    const video = shell.querySelector(":scope > video");
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
    }`;

const targetEnhancerHeroPolicy = `    const video = shell.querySelector(":scope > video");
    if (video) {
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "metadata";
    }`;

const motionBlock = `  const grooveDelays = {
    details: [0, 40, 64, 104, 128, 168],
    filter: [0, 28, 44, 72, 88, 108],
    search: [0, 24, 40, 64, 80, 96],
    intent: [0, 32, 52, 84, 104]
  };

  function grooveDelay(reason, index) {
    const profile = grooveDelays[reason] || grooveDelays.filter;
    return profile[Math.min(index, profile.length - 1)];
  }

  function cancelLayoutAnimations() {
    if (typeof document.getAnimations !== "function") return;
    document.getAnimations().forEach((animation) => {
      if (animation.id?.startsWith("citymeter-layout-") || animation.id === "citymeter-details-reveal" || animation.id === "citymeter-intent-reveal" || animation.id === "citymeter-results-ack") animation.cancel();
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
    const resultsText = document.querySelector(".results-line strong")?.textContent || "";
    cancelLayoutAnimations();
    pendingLayoutMotion = {
      control,
      reason,
      sequence,
      layoutEnabled,
      resultsText,
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
    const delays = [0, 48, 72, 120, 144];
    const animations = [];
    const children = details.querySelector(".source-review")
      ? Array.from(details.querySelector(".source-review").children)
      : Array.from(details.children).filter((child) => child.tagName !== "SUMMARY");
    children.slice(0, 5).forEach((child, index) => {
      const keyframes = coarsePointer.matches
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "translateY(0)" }];
      const animation = child.animate(keyframes, {
        duration: coarsePointer.matches ? 160 : 200,
        delay: coarsePointer.matches ? 0 : delays[index],
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
    return [proof.querySelector(".intent-proof-visual"), proof.querySelector(".intent-proof-copy")]
      .filter(Boolean)
      .map((part, index) => {
        const animation = part.animate(
          coarsePointer.matches
            ? [{ opacity: .72 }, { opacity: 1 }]
            : [{ opacity: .72, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: coarsePointer.matches ? 160 : 200, delay: coarsePointer.matches ? 0 : index * 48, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }
        );
        animation.id = "citymeter-intent-reveal";
        return animation.finished.catch(() => {});
      });
  }

  function acknowledgeResults(previousText) {
    const count = document.querySelector(".results-line strong");
    if (!count || count.textContent === previousText || reducedMotion.matches || typeof count.animate !== "function") return [];
    const animation = count.animate(
      coarsePointer.matches
        ? [{ opacity: .68 }, { opacity: 1 }]
        : [{ opacity: .68, transform: "translateY(3px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 160, easing: "cubic-bezier(.16,1,.3,1)" }
    );
    animation.id = "citymeter-results-ack";
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
    const duration = snapshot.reason === "search" ? 200 : 280;
    moved.forEach(({ card, deltaX, deltaY }, index) => {
      const animation = card.animate(
        [{ transform: "translate3d(" + deltaX + "px, " + deltaY + "px, 0)" }, { transform: "translate3d(0, 0, 0)" }],
        {
          duration,
          delay: grooveDelay(snapshot.reason, index),
          easing: "cubic-bezier(.2,0,0,1)",
          fill: "backwards"
        }
      );
      animation.id = "citymeter-layout-" + snapshot.reason;
      animations.push(animation.finished.catch(() => {}));
    });

    let enteredCards = 0;
    if (snapshot.reason === "filter" || snapshot.reason === "search") {
      const entryDelays = [0, 44, 68, 112, 136];
      visibleDatasetCards()
        .filter((card) => !snapshot.rects.has(card.id) && isNearViewport(card.getBoundingClientRect()))
        .slice(0, 5)
        .forEach((card, index) => {
          const keyframes = coarsePointer.matches
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }];
          const animation = card.animate(keyframes, {
            duration: coarsePointer.matches ? 160 : 200,
            delay: coarsePointer.matches ? 0 : entryDelays[index],
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards"
          });
          animation.id = "citymeter-layout-" + snapshot.reason + "-enter";
          animations.push(animation.finished.catch(() => {}));
          enteredCards += 1;
        });
      animations.push(...acknowledgeResults(snapshot.resultsText));
    }

    if (snapshot.reason === "details") animations.push(...revealOpenedDetails(snapshot.control.closest(".dataset-details")));
    if (snapshot.reason === "intent") animations.push(...revealIntentProof());

    const maxDelay = moved.length > 0 ? grooveDelay(snapshot.reason, moved.length - 1) : 0;
    document.documentElement.dataset.layoutMotion = animations.length ? "active" : "settled";
    document.documentElement.dataset.motionMoved = String(moved.length);
    document.documentElement.dataset.motionEntered = String(enteredCards);
    globalThis.__CITYMETER_MOTION_DEBUG__ = {
      reason: snapshot.reason,
      sequence: snapshot.sequence,
      movedCards: moved.length,
      enteredCards,
      duration,
      maxDelay,
      totalDuration: duration + maxDelay,
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

  function settleReducedMotion() {
    if (!reducedMotion.matches) return;
    if (layoutMotionFrame) cancelAnimationFrame(layoutMotionFrame);
    layoutMotionFrame = 0;
    layoutMotionSequence += 1;
    pendingLayoutMotion = null;
    cancelLayoutAnimations();
    document.documentElement.dataset.layoutMotion = "settled";
  }

  function installResponsiveMotion() {
    if (motionInstalled) return;
    motionInstalled = true;
    reducedMotion.addEventListener?.("change", settleReducedMotion);
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

  function installDatasetPreviewWarmup() {
    const explorer = document.querySelector(".explorer-section");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const constrained = !!connection?.saveData || ["slow-2g", "2g"].includes((connection?.effectiveType || "").toLowerCase());
    if (!explorer || constrained || typeof IntersectionObserver !== "function") {
      globalThis.__CITYMETER_PREVIEW_WARMUP__ = { status: constrained ? "skipped-data-saver" : "native-lazy", promoted: 0 };
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const images = Array.from(explorer.querySelectorAll(".dataset-card .dataset-image img"))
        .filter((image) => !image.complete)
        .map((image) => ({ image, rect: image.getBoundingClientRect() }))
        .sort((a, b) => Math.abs(a.rect.top - b.rect.top) < 2 ? a.rect.left - b.rect.left : a.rect.top - b.rect.top)
        .slice(0, 3);
      images.forEach(({ image }) => {
        image.loading = "eager";
        image.fetchPriority = "high";
        image.decode?.().catch(() => {});
      });
      globalThis.__CITYMETER_PREVIEW_WARMUP__ = { status: "promoted-first-row", promoted: images.length, startedAt: Date.now() };
    }, { rootMargin: "1000px 0px", threshold: 0 });
    observer.observe(explorer);
  }

`;

const performanceRuntimeBlock = `  let registryPromise = null;

  function loadSourceRegistry() {
    if (!registryPromise) {
      registryPromise = fetch(assetBase + "data/catalog-source-review.json?v=20260816-motion-image-performance-v23", { cache: "force-cache" }).then(async (response) => {
        if (!response.ok) throw new Error("Source registry returned " + response.status);
        return { registry: await response.json() };
      }).catch((error) => ({ error }));
    }
    return registryPromise;
  }

  async function start() {
    installResponsiveMotion();
    installDatasetPreviewWarmup();
    const registryResultPromise = loadSourceRegistry();
    const enhanceAfterHydration = async () => {
      await waitForHydrationStability();
      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          enhanceHero();
          const { registry, error } = await registryResultPromise;
          if (error) {
            console.error("CityMETER source-registry enhancements are unavailable", error);
            return;
          }
          recordById = new Map(registry.records.map((record) => [record.id, record]));
          applyEnhancements();
          new MutationObserver(scheduleEnhancements).observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
        });
      });
    };

    if (document.readyState === "complete") enhanceAfterHydration();
    else window.addEventListener("load", enhanceAfterHydration, { once: true });
  }

`;

const v23Css = `
/* CityMETER groove and image-performance release v23. */
.intent-tab .intent-icon {
  transition:
    color var(--motion-duration-state) var(--motion-ease-state),
    background-color var(--motion-duration-state) var(--motion-ease-state),
    border-color var(--motion-duration-state) var(--motion-ease-state);
}

.intent-tab > svg {
  transition: color var(--motion-duration-state) var(--motion-ease-state);
}

.site-footer .footer-social a:hover,
.site-footer .footer-social a:focus-visible {
  transform: none;
}

@media (hover: hover) and (pointer: fine) {
  .site-footer .footer-social a:hover {
    transform: translateY(-2px);
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

function updateDatasetPreviewMarkup(html, page) {
  const parts = html.split('<article class="dataset-card"');
  assert(parts.length === 39, page + " must contain 38 prerendered dataset cards");
  for (let index = 1; index < parts.length; index += 1) {
    const closeIndex = parts[index].indexOf("</article>");
    assert(closeIndex > 0, page + " dataset card closing tag is missing");
    let card = parts[index].slice(0, closeIndex);
    const tail = parts[index].slice(closeIndex);
    const v2Count = card.split("media/previews-v2/").length - 1;
    const v3Count = card.split("media/previews-v3/").length - 1;
    assert((v2Count === 1 && v3Count === 0) || (v2Count === 0 && v3Count === 1), page + " dataset card preview owner must be v2 or v3 exactly once");
    if (v2Count === 1) card = card.replace("media/previews-v2/", "media/previews-v3/");
    const oldSizeCount = card.split('width="1200" height="750"').length - 1;
    const newSizeCount = card.split('width="800" height="500"').length - 1;
    assert((oldSizeCount === 1 && newSizeCount === 0) || (oldSizeCount === 0 && newSizeCount === 1), page + " dataset preview dimensions must be old or new exactly once");
    if (oldSizeCount === 1) card = card.replace('width="1200" height="750"', 'width="800" height="500"');
    parts[index] = card + tail;
  }
  return parts.join('<article class="dataset-card"');
}

const sourceBundleText = readAsset(sourceBundle);
const sourceCssText = readAsset(sourceCss);
const sourceEnhancementText = readAsset(sourceEnhancement);
assertImmutableSource(sourceBundle, sourceBundleText);
assertImmutableSource(sourceCss, sourceCssText);
assertImmutableSource(sourceEnhancement, sourceEnhancementText);

let nextBundle = replaceOnce(sourceBundleText, sourceDatasetImage, targetDatasetImage, "Hydrated dataset preview owner");
nextBundle = replaceDelimited(nextBundle, sourceHeroComponentStart, sourceHeroComponentEnd, targetHeroComponent, "Hero media owner");
nextBundle = replaceOnce(nextBundle, sourceHydrationTranscriptItem, targetHydrationTranscriptItem, "Hydration-stable hero transcript owner");
nextBundle = replaceOnce(nextBundle, sourceUnsupportedIntersectionFallback, targetUnsupportedIntersectionFallback, "Fail-closed hero intersection fallback");
nextBundle = replaceDelimited(nextBundle, sourceSchemaComponentStart, sourceSchemaComponentEnd, targetSchemaComponent, "Canonical JSON-LD hydration owner");
writeFileSync(join(root, "assets", targetBundle), nextBundle);

const nextCss = sourceCssText.trimEnd() + "\n" + v23Css.trim() + "\n";
writeFileSync(join(root, "assets", targetCss), nextCss);

let nextEnhancement = replaceDelimited(sourceEnhancementText, "  function cancelLayoutAnimations()", "  function enhanceCard(card)", motionBlock, "Responsive motion owner");
nextEnhancement = replaceDelimited(nextEnhancement, "  async function start()", '  if (document.readyState === "loading")', performanceRuntimeBlock, "Enhancement startup owner");
nextEnhancement = replaceOnce(nextEnhancement, sourceEnhancerHeroAutoplay, targetEnhancerHeroPolicy, "Enhancer hero autoplay ownership");
writeFileSync(join(root, "assets", targetEnhancement), nextEnhancement);

const previewManifest = JSON.parse(readFileSync(join(root, "media", "previews-v3", "manifest.json"), "utf8"));
assert(previewManifest.revision === "2026-08-16-preview-v3" && previewManifest.files?.length === 38, "Preview v3 manifest is missing or incomplete");
assert(previewManifest.totals?.outputBytes <= 1450000, "Preview v3 byte budget exceeds 1.45 MB");

for (const page of ["index.html", "en/index.html"]) {
  const path = join(root, page);
  let html = readFileSync(path, "utf8");
  html = updateDatasetPreviewMarkup(html, page);
  html = replaceActiveRef(html, sourceBundle, targetBundle, page + " bundle ref");
  html = replaceActiveRef(html, sourceCss, targetCss, page + " CSS ref");
  html = replaceActiveRef(html, sourceEnhancement, targetEnhancement, page + " enhancement ref");
  html = replaceActiveRef(html, previousReleaseReceipt, releaseReceipt, page + " receipt");
  writeFileSync(path, html);
}

console.log("Applied " + releaseReceipt + " with immutable v12/v21/v19 assets.");
