(() => {
  "use strict";

  const assetBase = globalThis.__CITYMETER_ASSET_BASE__ || "./";
  const language = document.documentElement.lang === "en" ? "en" : "th";
  const text = {
    th: {
      summary: "ที่มา ขอบเขต และรายละเอียด",
      verifiedSummary: "ที่มา ขอบเขต และข้อมูลที่ยืนยันแล้ว",
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
      heroQrTitle: "สแกนเพื่อเปิดหน้านี้",
      heroQrHint: "ดูต่อบนมือถือได้ทันที",
      heroQrAlt: "QR code สำหรับเปิดหน้า CityMETER ภาษาไทย",
      supporterAlt: "depa, dSURE Software และบัญชีบริการดิจิทัล",
      examplesIntro: "เริ่มจากภาพจริงที่ทำให้เห็นโอกาสของพื้นที่ แล้วค่อยเปิดดูที่มา ขอบเขต และรายละเอียดเมื่อพร้อมตัดสินใจ",
      visualFocus: {
        "dataset-buildings": {
          label: "สวนพลู · อาคาร 3 มิติ · GFA",
          intro: "สำรวจความเข้มข้นของอาคาร GFA ความสูง และจำนวนชั้นแบบ 3 มิติในสวนพลู",
          coverage: "ภาพตัวอย่างโฟกัสสวนพลู; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ",
          unit: "ภาพแสดงอาคาร 3 มิติและตัวชี้วัดระดับพื้นที่; ความครบถ้วนของรูปทรงรายอาคารยังไม่ยืนยัน",
          revision: "20260814-suan-plu-3d"
        },
        "dataset-land-appraisal": {
          label: "เมืองชลบุรี · ราคาประเมิน 3 มิติ",
          intro: "เห็นโครงสร้างราคาประเมินที่ดินแบบ 3 มิติในอำเภอเมืองชลบุรี พร้อมจำนวนโฉนดและการกระจายราคา",
          coverage: "ภาพตัวอย่างโฟกัสอำเภอเมืองชลบุรี; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ",
          unit: "ภาพแสดงโซนราคาประเมินแบบ 3 มิติและจำนวนโฉนด; รายละเอียดรูปแปลงรายแปลงยังไม่ยืนยัน",
          revision: "20260814-mueang-chonburi-3d"
        },
        "dataset-flood-recurrent": {
          label: "ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี",
          intro: "เห็นขอบเขตน้ำท่วมรายปีและการเกิดซ้ำในอำเภอผักไห่ พร้อมเทียบกราฟย้อนหลัง 14 ปี",
          coverage: "ภาพตัวอย่างโฟกัสอำเภอผักไห่ พระนครศรีอยุธยา; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ",
          unit: "ภาพแสดงขอบเขตอำเภอ พื้นที่น้ำท่วม และสรุประดับตำบล; ความละเอียดของข้อมูลน้ำท่วมต้นทางยังไม่ยืนยัน",
          revision: "20260814-phak-hai-flood"
        },
        "dataset-road-network-archetypes": {
          label: "ปทุมวัน · Road DNA · รูปแบบถนน",
          intro: "สำรวจรูปแบบโครงข่ายถนนในปทุมวัน พร้อมสัดส่วนทางตัน ความหนาแน่นทางแยก และ Road DNA",
          coverage: "ภาพตัวอย่างโฟกัสเขตปทุมวัน กรุงเทพมหานคร; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ยืนยัน",
          unit: "ภาพแสดงพื้นที่วิเคราะห์แบบ hexagon และตัวชี้วัด Road DNA; วิธีสร้างหน่วยวิเคราะห์ยังไม่มีคำอธิบายสาธารณะ",
          revision: "20260814-pathum-wan-road-dna"
        },
        "dataset-crop-area-output": {
          label: "เวียงทอง · ผลผลิตรายเดือน",
          intro: "ดูพื้นที่เพาะปลูกและผลผลิตรายเดือนใน อบต.เวียงทอง พร้อมแยกชนิดพืชและกราฟช่วงเวลา",
          coverage: "ภาพตัวอย่างโฟกัส อบต.เวียงทอง จังหวัดแพร่; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ",
          unit: "ภาพแสดงหน่วยหมู่บ้านและกริด hexagon พร้อมสรุปผลผลิต; วิธีแปลงข้อมูลต้นทางยังไม่ยืนยัน",
          revision: "20260814-wiang-thong-crops"
        },
        "dataset-flood-forecast-flash-flood-risk": {
          label: "24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน",
          intro: "เห็นระดับความเสี่ยง 24 ชั่วโมงบนแผนที่ประเทศไทย พร้อมอันดับจังหวัดและเวลาออกรัน",
          coverage: "ภาพตัวอย่างแสดงภาพรวมประเทศไทยและอันดับจังหวัด; ขอบเขตของโมเดลต้นทางยังไม่ระบุบนหน้าสาธารณะ",
          unit: "ภาพยืนยันการเปรียบเทียบระดับจังหวัด; ความละเอียดระดับลุ่มน้ำหรือพื้นผิวโมเดลยังไม่เผยแพร่",
          revision: "20260814-flash-flood-thailand"
        }
      },
      chapters: [
        {
          kicker: "คน + อาคาร",
          title: "เห็นฐานประชากรทั่วประเทศ แล้วเจาะอาคาร 3 มิติที่สวนพลู",
          note: "อ่านโครงสร้างวัย ก่อนเจาะ GFA ความสูง และจำนวนชั้นในพื้นที่จริง"
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
      summary: "Sources, scope and details",
      verifiedSummary: "Sources, scope and verified lineage",
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
      heroQrTitle: "Scan to open this page",
      heroQrHint: "Continue on your phone",
      heroQrAlt: "QR code to open the English CityMETER page",
      supporterAlt: "depa, dSURE Software and Digital Service Account",
      examplesIntro: "Start with real views that reveal what is interesting about a place, then open the sources, scope and details when you are ready to decide.",
      visualFocus: {
        "dataset-buildings": {
          label: "Suan Plu · 3D buildings · GFA",
          intro: "Explore 3D building intensity, GFA, height and floor counts in Suan Plu",
          coverage: "The example focuses on Suan Plu; source coverage beyond the example is not stated on the public page",
          unit: "The view shows 3D buildings and area metrics; completeness of individual building geometry is not verified",
          revision: "20260814-suan-plu-3d"
        },
        "dataset-land-appraisal": {
          label: "Mueang Chonburi · 3D appraisal",
          intro: "See the 3D land-appraisal pattern across Mueang Chonburi with deed counts and the price distribution",
          coverage: "The example focuses on Mueang Chonburi; source coverage beyond the example is not stated on the public page",
          unit: "The view shows 3D appraisal-price zones and deed counts; individual parcel geometry is not verified",
          revision: "20260814-mueang-chonburi-3d"
        },
        "dataset-flood-recurrent": {
          label: "Phak Hai · 14-year flood history",
          intro: "See annual flood extent and recurrence in Phak Hai with a 14-year comparison chart",
          coverage: "The example focuses on Phak Hai, Phra Nakhon Si Ayutthaya; source coverage beyond the example is not stated on the public page",
          unit: "The view shows district extent, flooded areas and subdistrict summaries; source flood-data resolution is not verified",
          revision: "20260814-phak-hai-flood"
        },
        "dataset-road-network-archetypes": {
          label: "Pathum Wan · Road DNA · archetypes",
          intro: "Explore Pathum Wan road-network archetypes with dead-end ratio, intersection density and Road DNA",
          coverage: "The example focuses on Pathum Wan, Bangkok; source coverage beyond the example is not verified",
          unit: "The view shows hexagonal analysis areas and Road DNA metrics; construction of the analytical unit is not publicly documented",
          revision: "20260814-pathum-wan-road-dna"
        },
        "dataset-crop-area-output": {
          label: "Wiang Thong · monthly output",
          intro: "See monthly cultivated area and output in Wiang Thong TAO, separated by crop and time period",
          coverage: "The example focuses on Wiang Thong TAO, Phrae; source coverage beyond the example is not stated on the public page",
          unit: "The view shows village units, a hexagonal grid and output summaries; transformation from the source data is not verified",
          revision: "20260814-wiang-thong-crops"
        },
        "dataset-flood-forecast-flash-flood-risk": {
          label: "24-hour flash-flood risk by province",
          intro: "See 24-hour risk levels across Thailand with province ranking and forecast run time",
          coverage: "The example shows a Thailand overview and province ranking; source-model coverage is not stated on the public page",
          unit: "Province comparison is evidenced; watershed or model-surface resolution is not published",
          revision: "20260814-flash-flood-thailand"
        }
      },
      chapters: [
        {
          kicker: "People + buildings",
          title: "Start with Thailand's population, then enter 3D Suan Plu",
          note: "Read age structure first, then GFA, height and floor count in a real area"
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
  let motionInstalled = false;
  let pendingLayoutMotion = null;
  let layoutMotionFrame = 0;
  const reducedMotion = globalThis.matchMedia
    ? globalThis.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

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

  function visibleDatasetCards() {
    return Array.from(document.querySelectorAll(".dataset-card")).filter((card) => {
      const rect = card.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }

  function cancelLayoutAnimations() {
    if (typeof document.getAnimations !== "function") return;
    document.getAnimations().forEach((animation) => {
      if (animation.id?.startsWith("citymeter-layout-")) animation.cancel();
    });
  }

  function captureCardLayout(control) {
    if (reducedMotion.matches || typeof Element.prototype.animate !== "function") {
      pendingLayoutMotion = null;
      globalThis.__CITYMETER_MOTION_DEBUG__ = {
        reason: "reduced-motion",
        movedCards: 0,
        duration: 0,
        reducedMotion: true,
        startedAt: Date.now()
      };
      return;
    }
    const reason = control.matches(".dataset-details > summary")
      ? "details"
      : control.matches(".search-control input")
        ? "search"
        : control.matches(".intent-tab")
          ? "intent"
          : "filter";
    pendingLayoutMotion = {
      control,
      reason,
      rects: new Map(visibleDatasetCards().map((card) => [card.id, card.getBoundingClientRect()]))
    };
    document.documentElement.dataset.motionCaptured = reason;
    cancelLayoutAnimations();
  }

  function revealOpenedDetails(details) {
    if (!details?.open || reducedMotion.matches || typeof Element.prototype.animate !== "function") return;
    Array.from(details.children)
      .filter((child) => child.tagName !== "SUMMARY")
      .slice(0, 5)
      .forEach((child, index) => {
        const animation = child.animate(
          [
            { opacity: 0, transform: "translateY(-8px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          {
            duration: 200,
            delay: Math.min(index * 60, 240),
            easing: "cubic-bezier(.16,1,.3,1)"
          }
        );
        animation.id = "citymeter-details-reveal";
      });
  }

  function revealIntentProof() {
    const proof = document.querySelector(".intent-proof");
    if (!proof || reducedMotion.matches || typeof Element.prototype.animate !== "function") return;
    const animation = proof.animate(
      [
        { opacity: .72, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      {
        duration: 200,
        easing: "cubic-bezier(.16,1,.3,1)"
      }
    );
    animation.id = "citymeter-intent-reveal";
  }

  function animateCapturedLayout() {
    layoutMotionFrame = 0;
    const snapshot = pendingLayoutMotion;
    pendingLayoutMotion = null;
    if (!snapshot || reducedMotion.matches || typeof Element.prototype.animate !== "function") return;

    const animations = [];
    let movedCards = 0;
    let enteredCards = 0;
    snapshot.rects.forEach((first, cardId) => {
      const card = document.getElementById(cardId);
      if (!card?.isConnected) return;
      const last = card.getBoundingClientRect();
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;
      const animation = card.animate(
        [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: "translate3d(0, 0, 0)" }
        ],
        {
          duration: 280,
          easing: "cubic-bezier(.2,0,0,1)"
        }
      );
      animation.id = `citymeter-layout-${snapshot.reason}`;
      animations.push(animation.finished.catch(() => {}));
      movedCards += 1;
    });

    visibleDatasetCards()
      .filter((card) => !snapshot.rects.has(card.id))
      .slice(0, 5)
      .forEach((card, index) => {
        const animation = card.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          {
            duration: 200,
            delay: Math.min(index * 60, 240),
            easing: "cubic-bezier(.16,1,.3,1)"
          }
        );
        animation.id = `citymeter-layout-${snapshot.reason}-enter`;
        animations.push(animation.finished.catch(() => {}));
        enteredCards += 1;
      });

    if (snapshot.reason === "details") {
      revealOpenedDetails(snapshot.control.closest(".dataset-details"));
    }
    if (snapshot.reason === "intent") revealIntentProof();

    document.documentElement.dataset.layoutMotion = movedCards || enteredCards ? "active" : "settled";
    document.documentElement.dataset.motionMoved = String(movedCards);
    document.documentElement.dataset.motionEntered = String(enteredCards);
    globalThis.__CITYMETER_MOTION_DEBUG__ = {
      reason: snapshot.reason,
      movedCards,
      enteredCards,
      duration: 280,
      reducedMotion: false,
      startedAt: Date.now()
    };
    Promise.allSettled(animations).then(() => {
      if (document.documentElement.dataset.layoutMotion === "active") {
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
    document.addEventListener(
      "pointerdown",
      (event) => {
        const control = controlFromEvent(event);
        if (control) captureCardLayout(control);
      },
      true
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const control = controlFromEvent(event);
        if (control) captureCardLayout(control);
      },
      true
    );
    document.addEventListener(
      "click",
      (event) => {
        const control = controlFromEvent(event);
        if (!control) return;
        if (!pendingLayoutMotion || pendingLayoutMotion.control !== control) captureCardLayout(control);
        scheduleCapturedLayout();
      },
      true
    );
    document.addEventListener(
      "input",
      (event) => {
        const control = event.target instanceof Element
          ? event.target.closest(".search-control input")
          : null;
        if (!control) return;
        captureCardLayout(control);
        scheduleCapturedLayout();
      },
      true
    );
  }

  function enhanceCard(card) {
    const record = recordById.get(card.id);
    if (record?.citymeterUrl) {
      card.querySelectorAll(".dataset-image, .dataset-open, .dataset-mobile-link").forEach((link) => {
        if (link.getAttribute("href") !== record.citymeterUrl) link.href = record.citymeterUrl;
      });
    }
    const visualFocus = text.visualFocus[card.id];
    if (visualFocus) {
      const label = card.querySelector(".preview-focus-label");
      const intro = card.querySelector(":scope > .dataset-body > p");
      if (label && label.textContent !== visualFocus.label) label.textContent = visualFocus.label;
      if (intro && intro.textContent !== visualFocus.intro) intro.textContent = visualFocus.intro;
      const evidenceValues = card.querySelectorAll(":scope > .dataset-body > .evidence-summary dd, :scope > .dataset-body > .dataset-details .evidence-summary dd");
      if (evidenceValues[0] && evidenceValues[0].textContent !== visualFocus.coverage) evidenceValues[0].textContent = visualFocus.coverage;
      if (evidenceValues[1] && evidenceValues[1].textContent !== visualFocus.unit) evidenceValues[1].textContent = visualFocus.unit;
      card.querySelectorAll(".dataset-image img").forEach((image) => {
        const url = new URL(image.src, document.baseURI);
        if (url.searchParams.get("v") !== visualFocus.revision) {
          url.searchParams.set("v", visualFocus.revision);
          image.src = url.href;
        }
      });
    }
    if (!record || card.dataset.sourceReviewVersion === "2026-08-14-r3") return;

    const details = card.querySelector(".dataset-details");
    const openLink = card.querySelector(".dataset-open");
    const title = card.querySelector("h3")?.textContent?.trim() || card.id;
    if (!details || !openLink) return;

    card.dataset.sourceStatus = record.status;
    card.dataset.sourceReviewVersion = "2026-08-14-r3";
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

    const evidence = card.querySelector(":scope > .dataset-body > .evidence-summary");
    if (evidence && !details.contains(evidence)) {
      evidence.classList.add("evidence-summary-in-details");
      details.insertBefore(evidence, details.children[1] || null);
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
      const reelRevision = "20260814-suan-plu-3d";
      if (video.dataset.reelRevision !== reelRevision) {
        const exhibition = new URLSearchParams(location.search).get("display") === "exhibition";
        const source = video.querySelector("source");
        if (source) source.src = `${assetBase}media/reel/citymeter-proof-v3${exhibition ? "-exhibition" : ""}.mp4?v=${reelRevision}`;
        video.poster = `${assetBase}media/reel/citymeter-proof-v3-poster.webp?v=${reelRevision}`;
        video.dataset.reelRevision = reelRevision;
        video.load();
      }
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

    const pageTitle = document.querySelector("#page-title");
    if (pageTitle && pageTitle.textContent !== "CityMETER") pageTitle.textContent = "CityMETER";

    const heroCopy = document.querySelector(".hero-copy");
    if (heroCopy) {
      let supporter = heroCopy.querySelector(".supporter-lockup-hero");
      if (!supporter) {
        supporter = element("div", "supporter-lockup supporter-lockup-hero");
        const logo = document.createElement("img");
        logo.src = `${assetBase}media/depa-dsure-tdc-lockup.png`;
        logo.alt = text.supporterAlt;
        logo.width = 6541;
        logo.height = 1561;
        logo.decoding = "async";
        supporter.append(logo);
      }
      const actions = heroCopy.querySelector(".hero-actions");
      if (actions && actions.nextElementSibling !== supporter) actions.after(supporter);
    }

    if (heroCopy && !heroCopy.querySelector(".hero-page-qr")) {
      const qrBlock = element("div", "hero-page-qr");
      const qr = document.createElement("img");
      qr.className = "hero-page-qr-image";
      qr.src = `${assetBase}media/qr/citymeter-page-${language}.png`;
      qr.alt = text.heroQrAlt;
      qr.width = 512;
      qr.height = 512;
      qr.decoding = "async";
      const copy = element("div", "hero-page-qr-copy");
      copy.append(element("strong", "", text.heroQrTitle));
      copy.append(element("span", "", text.heroQrHint));
      qrBlock.append(qr, copy);
      heroCopy.append(qrBlock);
    }

    const examplesIntro = document.querySelector("#examples .section-heading > p:last-child");
    if (examplesIntro && examplesIntro.textContent !== text.examplesIntro) examplesIntro.textContent = text.examplesIntro;
  }

  function enhanceFooterBranding() {
    const footerLead = document.querySelector(".site-footer .footer-grid > div:first-child");
    if (!footerLead) return;
    let supporter = footerLead.querySelector(".supporter-lockup-footer");
    if (!supporter) {
      supporter = element("div", "supporter-lockup supporter-lockup-footer");
      const logo = document.createElement("img");
      logo.src = `${assetBase}media/depa-dsure-tdc-lockup.png`;
      logo.alt = text.supporterAlt;
      logo.width = 6541;
      logo.height = 1561;
      logo.loading = "lazy";
      logo.decoding = "async";
      supporter.append(logo);
      footerLead.append(supporter);
    }
  }

  function applyEnhancements() {
    scheduled = false;
    enhanceHero();
    enhanceFooterBranding();
    document.querySelectorAll(".dataset-card").forEach(enhanceCard);
  }

  function scheduleEnhancements() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyEnhancements);
  }

  async function start() {
    installResponsiveMotion();
    applyEnhancements();
    new MutationObserver(scheduleEnhancements).observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
    try {
      const response = await fetch(`${assetBase}data/catalog-source-review.json`, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Source registry returned ${response.status}`);
      const registry = await response.json();
      recordById = new Map(registry.records.map((record) => [record.id, record]));
      applyEnhancements();
    } catch (error) {
      console.error("CityMETER source-registry enhancements are unavailable", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
