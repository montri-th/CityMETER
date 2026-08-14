(() => {
  "use strict";

  const assetBase = globalThis.__CITYMETER_ASSET_BASE__ || "./";
  const language = document.documentElement.lang === "en" ? "en" : "th";
  const text = {
    th: {
      summary: "ที่มา · วิธีอ่าน · QR",
      verifiedSummary: "ที่มา · QR · ยืนยัน same-dataset lineage",
      verified: "ยืนยัน same-dataset lineage",
      candidate: "candidate — ต้องมีหลักฐานเพิ่ม",
      otherSource: "แหล่งอื่นที่ระบุได้",
      derived: "ผลวิเคราะห์/ชั้นข้อมูลต่อยอด",
      unproven: "ยังไม่ยืนยัน exact public lineage",
      source: "ที่มาและหลักฐานที่ตรวจได้",
      period: "ขอบเขตเวลา/การเผยแพร่",
      reading: "อ่านอย่างไรไม่ให้เกินหลักฐาน",
      official: "ช่องทางทางการ",
      gd: "GD Catalog",
      qrTitle: "สแกนเพื่อเปิดข้อมูลนี้ใน CityMETER",
      openMobile: "เปิดข้อมูลนี้บนมือถือ",
      lineageNote: "ป้ายนี้ยืนยันว่ามาจากชุดข้อมูลเดียวกันผ่านช่องทางทางการของเจ้าของข้อมูล ไม่ได้หมายความว่าทุกไฟล์ถูกดาวน์โหลดตรงจาก GD Catalog กลาง",
      conceptual: "ภาพประกอบแนวคิด — ไม่ใช่หน้าจอหรือข้อมูลจริง",
      realExample: "ตัวอย่างจากหน้าจอ CityMETER จริง",
      chapters: [
        {
          kicker: "คน + อาคาร",
          title: "เห็นฐานประชากรและรูปแบบการพัฒนาพร้อมกัน",
          note: "อ่านโครงสร้างวัย ความหนาแน่น GFA ความสูง และจำนวนชั้น"
        },
        {
          kicker: "การคลังท้องถิ่น",
          title: "เทียบฐานรายได้ของ อปท. โดยไม่ตัดสินจากยอดรวมอย่างเดียว",
          note: "แยกแหล่งรายได้ แล้วอ่านต่อคนและต่อพื้นที่อย่างมีบริบท"
        },
        {
          kicker: "อุปสงค์การท่องเที่ยว",
          title: "เห็นฤดูกาล ผู้เยี่ยมเยือน และการใช้จ่ายก่อนเลือกพื้นที่ที่ควรดูต่อ",
          note: "เปรียบเทียบจังหวัดและกลับไปตรวจนิยามต้นทางก่อนใช้"
        }
      ],
      path: "ประชากร + อาคาร → รายได้ อปท. → การท่องเที่ยว",
      caption: "3 มุมมองจริง หมุนวนอัตโนมัติ · วิดีโอไม่มีเสียง"
    },
    en: {
      summary: "Source · interpretation · QR",
      verifiedSummary: "Source · QR · verified same-dataset lineage",
      verified: "Verified same-dataset lineage",
      candidate: "Candidate — more evidence required",
      otherSource: "Identified non-GD source",
      derived: "Derived analysis or layer",
      unproven: "Exact public lineage not yet verified",
      source: "Source and evidence reviewed",
      period: "Period and release scope",
      reading: "How to read it within the evidence",
      official: "Official channel",
      gd: "GD Catalog",
      qrTitle: "Scan to open this view in CityMETER",
      openMobile: "Open this view on a phone",
      lineageNote: "This badge confirms same-dataset lineage through an official owner channel. It does not mean every file was downloaded directly from the central GD Catalog.",
      conceptual: "Concept illustration — not a product screen or real data",
      realExample: "Real CityMETER screen examples",
      chapters: [
        {
          kicker: "People + buildings",
          title: "Read the population base and development pattern together",
          note: "Age structure, density, GFA, height and floor count in one opening chapter"
        },
        {
          kicker: "Local finance",
          title: "Compare municipal revenue without judging places by one total",
          note: "Separate revenue sources, then read per-person and per-area measures in context"
        },
        {
          kicker: "Tourism demand",
          title: "See seasonality, visitors and spending before choosing where to look next",
          note: "Compare provinces, then return to the source definition before use"
        }
      ],
      path: "Population + buildings → municipal revenue → tourism",
      caption: "Three real views, replaying automatically · silent video"
    }
  }[language];

  const statusLabels = {
    "verified-lineage": text.verified,
    candidate: text.candidate,
    "other-source": text.otherSource,
    derived: text.derived,
    unproven: text.unproven
  };

  let recordById = new Map();
  let heroTimer = null;
  let heroVideo = null;
  let scheduled = false;

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function localized(record, key) {
    return record[`${key}${language === "th" ? "Th" : "En"}`] || "";
  }

  function appendLinkGroup(parent, label, links) {
    if (!Array.isArray(links) || links.length === 0) return;
    const group = element("div", "source-link-group");
    group.append(element("span", "source-link-label", label));
    const list = element("div", "source-links");
    for (const link of links) {
      const anchor = element("a", "source-link", language === "th" ? link.labelTh : link.labelEn);
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      list.append(anchor);
    }
    group.append(list);
    parent.append(group);
  }

  function makeLabeledCopy(label, copy) {
    const section = element("section", "source-copy-block");
    section.append(element("h4", "source-copy-label", label));
    section.append(element("p", "source-copy-text", copy));
    return section;
  }

  function enhanceCard(card) {
    const record = recordById.get(card.id);
    if (!record || card.dataset.sourceReviewVersion === "2026-08-14") return;

    const details = card.querySelector(".dataset-details");
    const openLink = card.querySelector(".dataset-open");
    const title = card.querySelector("h3")?.textContent?.trim() || card.id;
    if (!details || !openLink) return;

    card.dataset.sourceStatus = record.status;
    card.dataset.sourceReviewVersion = "2026-08-14";
    card.querySelectorAll(".dataset-image img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
    });

    const summary = details.querySelector("summary");
    if (summary) {
      summary.replaceChildren();
      summary.classList.add("source-summary");
      if (record.status === "verified-lineage") {
        const logo = document.createElement("img");
        logo.className = "gd-lineage-logo";
        logo.src = `${assetBase}media/gdcatalog-logo.png`;
        logo.alt = "Government Data Catalog Smart Plus";
        logo.width = 240;
        logo.height = 304;
        logo.loading = "lazy";
        logo.decoding = "async";
        summary.append(logo);
      } else {
        summary.append(element("span", "source-status-dot"));
      }
      summary.append(element("span", "source-summary-copy", record.status === "verified-lineage" ? text.verifiedSummary : text.summary));
    }

    details.querySelector(".source-review")?.remove();
    const review = element("div", "source-review");
    review.append(element("span", `source-status source-status-${record.status}`, statusLabels[record.status] || text.unproven));
    review.append(makeLabeledCopy(text.source, `${localized(record, "owner")} — ${localized(record, "source")}`));
    if (localized(record, "period")) review.append(makeLabeledCopy(text.period, localized(record, "period")));
    review.append(makeLabeledCopy(text.reading, localized(record, "reading")));
    appendLinkGroup(review, text.official, record.official);
    appendLinkGroup(review, text.gd, record.gd);
    if (record.status === "verified-lineage") review.append(element("p", "lineage-definition", text.lineageNote));

    const handoff = element("div", "dataset-qr-handoff");
    const qr = document.createElement("img");
    qr.className = "dataset-qr-image";
    qr.src = `${assetBase}media/qr/${record.id.replace(/^dataset-/, "")}.png`;
    qr.alt = `${text.qrTitle}: ${title}`;
    qr.width = 256;
    qr.height = 256;
    qr.loading = "lazy";
    qr.decoding = "async";
    const handoffCopy = element("div", "dataset-qr-copy");
    handoffCopy.append(element("strong", "", text.qrTitle));
    const mobileLink = element("a", "dataset-mobile-link", text.openMobile);
    mobileLink.href = openLink.href;
    mobileLink.target = "_blank";
    mobileLink.rel = "noreferrer";
    handoffCopy.append(mobileLink);
    handoff.append(qr, handoffCopy);
    review.append(handoff);
    details.append(review);

    const imageLink = card.querySelector(".dataset-image");
    if (record.conceptualPreview && imageLink && !imageLink.querySelector(".conceptual-preview-label")) {
      imageLink.append(element("span", "conceptual-preview-label", text.conceptual));
    }
  }

  function currentChapter(time) {
    if (time < 6.3) return 0;
    if (time < 9.45) return 1;
    return 2;
  }

  function renderHeroChapter(shell, video) {
    const chapter = currentChapter(video?.currentTime || 0);
    const copy = text.chapters[chapter];
    const caption = shell.querySelector(".demo-story-caption");
    if (caption) {
      const parts = caption.querySelectorAll(":scope > span, :scope > strong, :scope > small");
      if (parts[0] && parts[0].textContent !== copy.kicker) parts[0].textContent = copy.kicker;
      if (parts[1] && parts[1].textContent !== copy.title) parts[1].textContent = copy.title;
      if (parts[2] && parts[2].textContent !== copy.note) parts[2].textContent = copy.note;
    }
    const progress = shell.querySelector(".demo-progress");
    if (progress) {
      if (progress.children.length !== 3) progress.replaceChildren(...Array.from({ length: 3 }, () => element("span")));
      Array.from(progress.children).forEach((item, index) => item.classList.toggle("is-active", index === chapter));
    }
  }

  function enhanceHero() {
    const shell = document.querySelector(".demo-video-shell");
    if (!shell) return;
    shell.classList.add("is-catalog-enhanced");

    let frame = shell.querySelector(":scope > .demo-video-frame");
    if (!frame) {
      frame = element("div", "demo-video-frame");
      shell.prepend(frame);
    }
    let panel = shell.querySelector(":scope > .demo-caption-panel");
    if (!panel) {
      panel = element("div", "demo-caption-panel");
      shell.append(panel);
    }

    shell.querySelectorAll(":scope > video, :scope > .demo-poster, :scope > .playback-control").forEach((node) => frame.append(node));
    shell.querySelectorAll(":scope > .live-example-label, :scope > .demo-progress, :scope > .demo-story-caption").forEach((node) => panel.append(node));

    const liveLabel = panel.querySelector(".live-example-label");
    if (liveLabel && liveLabel.dataset.chapterVersion !== "3") {
      liveLabel.dataset.chapterVersion = "3";
      const dot = liveLabel.querySelector("span");
      liveLabel.replaceChildren();
      if (dot) liveLabel.append(dot);
      liveLabel.append(document.createTextNode(text.realExample));
    }

    const video = frame.querySelector("video");
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
      renderHeroChapter(shell, video);
      if (video !== heroVideo) {
        heroVideo = video;
        if (heroTimer) clearInterval(heroTimer);
        heroTimer = setInterval(() => {
          if (heroVideo?.isConnected) renderHeroChapter(shell, heroVideo);
        }, 250);
      }
    }

    const figure = shell.closest(".demo-figure");
    const figcaption = figure?.querySelector(":scope > figcaption");
    if (figcaption) {
      const parts = figcaption.querySelectorAll(":scope > span");
      if (parts[0] && parts[0].textContent !== text.path) parts[0].textContent = text.path;
      if (parts[1] && parts[1].textContent !== text.caption) parts[1].textContent = text.caption;
    }
    const transcript = figure?.querySelector("#demo-transcript");
    if (transcript && transcript.dataset.chapterVersion !== "3") {
      transcript.dataset.chapterVersion = "3";
      const ordered = element("ol");
      for (const chapter of text.chapters) ordered.append(element("li", "", `${chapter.kicker}. ${chapter.title}. ${chapter.note}`));
      transcript.replaceChildren(element("p", "", text.caption), ordered);
    }
  }

  function applyEnhancements() {
    scheduled = false;
    enhanceHero();
    document.querySelectorAll(".dataset-card").forEach(enhanceCard);
  }

  function scheduleEnhancements() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyEnhancements);
  }

  async function start() {
    try {
      const response = await fetch(`${assetBase}data/catalog-source-review.json`, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Source registry returned ${response.status}`);
      const registry = await response.json();
      recordById = new Map(registry.records.map((record) => [record.id, record]));
      applyEnhancements();
      new MutationObserver(scheduleEnhancements).observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
    } catch (error) {
      console.error("CityMETER catalog enhancements could not start", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
