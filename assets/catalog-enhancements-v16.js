(() => {
  "use strict";

  const assetBase = globalThis.__CITYMETER_ASSET_BASE__ || "./";
  const language = document.documentElement.lang === "en" ? "en" : "th";
  const text = {
    th: {
      summary: "ใช้ข้อมูลนี้ทำอะไรได้",
      verifiedSummary: "ใช้ข้อมูลนี้ทำอะไรได้",
      verified: "ยืนยันแหล่งข้อมูลต้นทางแล้ว",
      candidate: "พบแหล่งข้อมูลที่เกี่ยวข้อง",
      otherSource: "ใช้แหล่งข้อมูลเฉพาะด้าน",
      derived: "CityMETER คำนวณและสรุปต่อยอด",
      unproven: "ข้อมูลสำรวจเบื้องต้น",
      benefit: "ข้อมูลนี้ช่วยตอบอะไร",
      coverage: "ดูพื้นที่ไหนได้บ้าง",
      granularity: "ดูได้ละเอียดแค่ไหน",
      source: "ข้อมูลมาจากไหน",
      period: "ข้อมูลครอบคลุมช่วงไหน",
      reading: "ก่อนใช้ตัดสินใจ",
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
      supporterLabel: "หน่วยงานและเครื่องหมายรับรองที่เกี่ยวข้อง",
      supporterAlt: {
        depa: "depa",
        dsure: "dSURE Software",
        account: "บัญชีบริการดิจิทัล"
      },
      examplesIntro: "เริ่มจากภาพจริงที่ทำให้เห็นโอกาสของพื้นที่ แล้วค่อยเปิดดูที่มา ขอบเขต และรายละเอียดเมื่อพร้อมตัดสินใจ",
      visualFocus: {
        "dataset-buildings": {
          label: "สวนพลู · อาคาร 3 มิติ · GFA",
          intro: "สำรวจความเข้มข้นของอาคาร GFA ความสูง และจำนวนชั้นแบบ 3 มิติในสวนพลู",
          coverage: "เริ่มจากตัวอย่างสวนพลู แล้วตรวจพื้นที่ครอบคลุมจากข้อมูลต้นทางก่อนนำผลไปเทียบพื้นที่อื่น",
          unit: "ดูอาคาร 3 มิติและตัวชี้วัดระดับพื้นที่ได้ หากต้องใช้รูปทรงรายอาคารให้ตรวจความครบถ้วนจากข้อมูลต้นทาง",
          revision: "20260814-suan-plu-3d"
        },
        "dataset-land-appraisal": {
          label: "เมืองชลบุรี · ราคาประเมิน 3 มิติ",
          intro: "เห็นโครงสร้างราคาประเมินที่ดินแบบ 3 มิติในอำเภอเมืองชลบุรี พร้อมจำนวนโฉนดและการกระจายราคา",
          coverage: "เริ่มจากตัวอย่างอำเภอเมืองชลบุรี แล้วตรวจพื้นที่ครอบคลุมจากข้อมูลต้นทางก่อนนำผลไปเทียบพื้นที่อื่น",
          unit: "ดูโซนราคาประเมิน 3 มิติและจำนวนโฉนดได้ หากต้องใช้รูปแปลงรายแปลงให้ตรวจจากข้อมูลต้นทาง",
          revision: "20260814-mueang-chonburi-3d"
        },
        "dataset-flood-recurrent": {
          label: "ผักไห่ · น้ำท่วมย้อนหลัง 14 ปี",
          intro: "เห็นขอบเขตน้ำท่วมรายปีและการเกิดซ้ำในอำเภอผักไห่ พร้อมเทียบกราฟย้อนหลัง 14 ปี",
          coverage: "เริ่มจากตัวอย่างอำเภอผักไห่ พระนครศรีอยุธยา แล้วตรวจพื้นที่ครอบคลุมก่อนนำผลไปเทียบพื้นที่อื่น",
          unit: "ดูขอบเขตอำเภอ พื้นที่น้ำท่วม และสรุประดับตำบลได้ หากต้องใช้พื้นที่ย่อยกว่านี้ให้ตรวจความละเอียดจากข้อมูลต้นทาง",
          revision: "20260814-phak-hai-flood"
        },
        "dataset-road-network-archetypes": {
          label: "ปทุมวัน · Road DNA · รูปแบบถนน",
          intro: "สำรวจรูปแบบโครงข่ายถนนในปทุมวัน พร้อมสัดส่วนทางตัน ความหนาแน่นทางแยก และ Road DNA",
          coverage: "เริ่มเปรียบเทียบรูปแบบถนนจากตัวอย่างเขตปทุมวัน แล้วตรวจข้อมูลต้นทางเมื่อต้องใช้กับพื้นที่อื่น",
          unit: "ดูพื้นที่วิเคราะห์และตัวชี้วัด Road DNA ได้ ก่อนตัดสินใจให้เปิดดูวิธีสร้างหน่วยวิเคราะห์",
          revision: "20260814-pathum-wan-road-dna"
        },
        "dataset-crop-area-output": {
          label: "เวียงทอง · ผลผลิตรายเดือน",
          intro: "ดูพื้นที่เพาะปลูกและผลผลิตรายเดือนใน อบต.เวียงทอง พร้อมแยกชนิดพืชและกราฟช่วงเวลา",
          coverage: "เริ่มจากตัวอย่าง อบต.เวียงทอง จังหวัดแพร่ แล้วตรวจพื้นที่ครอบคลุมก่อนนำผลไปเทียบพื้นที่อื่น",
          unit: "ดูผลผลิตระดับหมู่บ้านและกริดพื้นที่ได้ หากจะเทียบหรือรวมผลให้ตรวจวิธีแปลงข้อมูลต้นทางก่อน",
          revision: "20260814-wiang-thong-crops"
        },
        "dataset-flood-forecast-flash-flood-risk": {
          label: "24 ชั่วโมง · จังหวัดเสี่ยงน้ำท่วมฉับพลัน",
          intro: "เห็นระดับความเสี่ยง 24 ชั่วโมงบนแผนที่ประเทศไทย พร้อมอันดับจังหวัดและเวลาออกรัน",
          coverage: "เทียบภาพรวมประเทศไทยและอันดับจังหวัดในตัวอย่างได้ แล้วตรวจพื้นที่ครอบคลุมของโมเดลก่อนใช้",
          unit: "เปรียบเทียบระดับจังหวัดได้ หากต้องใช้ระดับลุ่มน้ำหรือพื้นผิวโมเดลให้ตรวจความละเอียดจากข้อมูลต้นทาง",
          revision: "20260814-flash-flood-thailand"
        }
      },
    },
    en: {
      summary: "What you can do with this data",
      verifiedSummary: "What you can do with this data",
      verified: "Source dataset verified",
      candidate: "Related source identified",
      otherSource: "Uses a specialist data source",
      derived: "Calculated and summarised by CityMETER",
      unproven: "Exploratory data view",
      benefit: "What this data helps you answer",
      coverage: "Where you can use it",
      granularity: "How detailed the view is",
      source: "Where the data comes from",
      period: "What period the data covers",
      reading: "Before making a decision",
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
      supporterLabel: "Related programme and certification marks",
      supporterAlt: {
        depa: "depa",
        dsure: "dSURE Software",
        account: "Digital Service Account"
      },
      examplesIntro: "Start with real views that reveal what is interesting about a place, then open the sources, scope and details when you are ready to decide.",
      visualFocus: {
        "dataset-buildings": {
          label: "Suan Plu · 3D buildings · GFA",
          intro: "Explore 3D building intensity, GFA, height and floor counts in Suan Plu",
          coverage: "Start with the Suan Plu example, then check source coverage before comparing other places.",
          unit: "View 3D buildings and area metrics, then check source completeness before relying on individual-building geometry.",
          revision: "20260814-suan-plu-3d"
        },
        "dataset-land-appraisal": {
          label: "Mueang Chonburi · 3D appraisal",
          intro: "See the 3D land-appraisal pattern across Mueang Chonburi with deed counts and the price distribution",
          coverage: "Start with the Mueang Chonburi example, then check source coverage before comparing other places.",
          unit: "View 3D appraisal zones and deed counts, then check the source before relying on individual parcel shapes.",
          revision: "20260814-mueang-chonburi-3d"
        },
        "dataset-flood-recurrent": {
          label: "Phak Hai · 14-year flood history",
          intro: "See annual flood extent and recurrence in Phak Hai with a 14-year comparison chart",
          coverage: "Start with the Phak Hai example, then check source coverage before comparing other places.",
          unit: "View district extent, flooded areas and subdistrict summaries, then check source resolution before using a smaller area.",
          revision: "20260814-phak-hai-flood"
        },
        "dataset-road-network-archetypes": {
          label: "Pathum Wan · Road DNA · archetypes",
          intro: "Explore Pathum Wan road-network archetypes with dead-end ratio, intersection density and Road DNA",
          coverage: "Start with the Pathum Wan road-pattern example and check the source before comparing other places.",
          unit: "View the analysis areas and Road DNA metrics, then review how the analytical unit was built before making a decision.",
          revision: "20260814-pathum-wan-road-dna"
        },
        "dataset-crop-area-output": {
          label: "Wiang Thong · monthly output",
          intro: "See monthly cultivated area and output in Wiang Thong TAO, separated by crop and time period",
          coverage: "Start with the Wiang Thong TAO example, then check source coverage before comparing other places.",
          unit: "View village-level output and the area grid, then review the source transformation before comparing or aggregating results.",
          revision: "20260814-wiang-thong-crops"
        },
        "dataset-flood-forecast-flash-flood-risk": {
          label: "24-hour flash-flood risk by province",
          intro: "See 24-hour risk levels across Thailand with province ranking and forecast run time",
          coverage: "Compare the Thailand overview and province ranking, then check model coverage before use.",
          unit: "Compare provinces, then check watershed or model-surface resolution before using a smaller area.",
          revision: "20260814-flash-flood-thailand"
        }
      },
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

  function makeEvidenceActionable(evidence) {
    if (!evidence) return;
    const labels = evidence.querySelectorAll("dt");
    [text.coverage, text.granularity].forEach((copy, index) => {
      const label = labels[index];
      if (!label) return;
      const textNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.textContent = copy;
    });

    const directReplacements = language === "th"
      ? new Map([
          ["มีหน้าสรุประดับประเทศไทย แต่ขอบเขตข้อมูลต้นทางยังไม่ระบุ", "เริ่มดูภาพรวมประเทศไทยได้ แล้วเปิดข้อมูลต้นทางเพื่อตรวจพื้นที่ครอบคลุมก่อนเปรียบเทียบ"],
          ["ขอบเขตพื้นที่ยังไม่ระบุบนหน้าสาธารณะ", "เริ่มจากพื้นที่ที่แสดงบนหน้าจอ แล้วเปิดข้อมูลต้นทางเพื่อตรวจพื้นที่ครอบคลุมก่อนนำไปเทียบ"],
          ["มีหน้าสรุประดับประเทศไทยและอันดับจังหวัด; ขอบเขตข้อมูลต้นทางยังไม่ระบุ", "เทียบภาพรวมประเทศไทยและอันดับจังหวัดได้ แล้วตรวจพื้นที่ครอบคลุมจากข้อมูลต้นทางก่อนใช้"],
          ["มีหน้าสรุประดับประเทศไทยและอันดับจังหวัด; ขอบเขตของโมเดลยังไม่ระบุ", "เทียบภาพรวมประเทศไทยและอันดับจังหวัดได้ แล้วตรวจพื้นที่ครอบคลุมของโมเดลก่อนใช้"],
          ["ระดับพื้นที่ย่อยสุดยังไม่ยืนยันจากหน้าสาธารณะ", "ใช้ระดับพื้นที่ที่แสดงบนหน้าจอ และตรวจหน่วยย่อยจากข้อมูลต้นทางก่อนอ้างอิง"],
          ["ยืนยันจากเส้นทางกรุงเทพฯ ที่ตรวจ; ขอบเขตพื้นที่อื่นยังไม่ยืนยัน", "เริ่มสำรวจจากเส้นทางกรุงเทพฯ ที่ตรวจแล้ว และตรวจข้อมูลต้นทางเพิ่มเติมเมื่อต้องเทียบพื้นที่อื่น"],
          ["มีการเปรียบเทียบระดับจังหวัด; ไม่รองรับข้อสรุประดับรถรายคัน", "ใช้เปรียบเทียบระดับจังหวัดได้ ส่วนข้อมูลรถรายคันต้องใช้แหล่งข้อมูลที่ออกแบบมาสำหรับงานนั้น"],
          ["เห็นพื้นที่สีตามรูปแบบโครงข่ายถนน แต่หน่วยวิเคราะห์พื้นฐานยังไม่มีคำอธิบายสาธารณะ", "เห็นรูปแบบโครงข่ายถนนในแต่ละพื้นที่ และควรเปิดดูวิธีสร้างหน่วยวิเคราะห์ก่อนนำไปตัดสินใจ"],
          ["หน้าตั้งต้นอยู่ในกรุงเทพฯ; ภาพรวมความครอบคลุมทั้งหมดของ locale ยังไม่เผยแพร่", "เริ่มดูบริบทพื้นที่กรุงเทพฯ ได้ หากจะใช้กับพื้นที่อื่นให้ตรวจรายชื่อ locale ที่รองรับจากข้อมูลต้นทาง"],
          ["locale เป็นหน่วยย่อยสุดที่เลือกได้; geometry และ crosswalk ไปขอบเขตบริการยังไม่ยืนยัน", "เลือกดูได้ถึงระดับ locale หากจะเทียบกับเขตบริการให้ตรวจรูปทรงพื้นที่และการจับคู่ขอบเขตจากข้อมูลต้นทาง"],
          ["ยืนยันหน่วยข้อมูลระดับองค์กรปกครองส่วนท้องถิ่น; geometry ของขอบเขตยังไม่ยืนยัน", "เปรียบเทียบได้ถึงระดับองค์กรปกครองส่วนท้องถิ่น หากต้องใช้แนวเขตบนแผนที่ให้ตรวจรูปทรงขอบเขตจากข้อมูลต้นทาง"],
          ["สถานีเซนเซอร์เป็นหน่วยย่อยสุดที่ยืนยันได้; รูปแบบ geometry บนแผนที่ยังไม่ยืนยัน", "ดูได้ถึงระดับสถานีเซนเซอร์ หากต้องใช้ตำแหน่งหรือรูปทรงบนแผนที่ให้ตรวจจากข้อมูลต้นทาง"]
        ])
      : new Map([
          ["A Thailand summary view is visible; source coverage is not stated", "Start with the Thailand overview, then check source coverage before comparing places."],
          ["Geographic coverage is not stated on the public page", "Start with the area shown, then check source coverage before comparing places."],
          ["A Thailand summary and province ranking are visible; source coverage is not stated", "Compare the Thailand overview and province ranking, then check source coverage before use."],
          ["A Thailand summary and province ranking are visible; model coverage is not stated", "Compare the Thailand overview and province ranking, then check model coverage before use."],
          ["The smallest supported geography is not yet verified from the public page", "Use the geography shown on screen and check the source before citing a smaller unit."],
          ["Evidenced on the inspected Bangkok route; broader geographic coverage is not verified", "Start with the inspected Bangkok route and check the source before comparing other areas."],
          ["Province comparison is evidenced; individual-vehicle detail is not supported", "Use it for province comparison; vehicle-level questions require a source designed for that purpose."],
          ["Coloured road-archetype areas are visible, but the underlying analytical unit is not publicly documented", "Compare the visible road-network patterns and review how the analytical unit was built before making a decision."],
          ["The default page is scoped to Bangkok; the full locale coverage is not published", "Start with the Bangkok place profiles and check the supported locale list before using the view elsewhere."],
          ["Locale is the smallest selectable unit; geometry and service-boundary crosswalks are not verified", "View individual locales, then check their shapes and boundary matching before comparing service areas."],
          ["The local authority is the evidenced record unit; boundary geometry is not verified", "Compare individual local authorities, then check mapped boundaries against the source before spatial analysis."],
          ["The sensor station is the smallest evidenced unit; map geometry is not verified", "View individual sensor stations, then check mapped locations against the source before spatial analysis."]
        ]);

    evidence.querySelectorAll("dd").forEach((item) => {
      let copy = item.textContent.trim();
      if (directReplacements.has(copy)) copy = directReplacements.get(copy);
      if (language === "th") {
        copy = copy
          .replace(/; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ระบุบนหน้าสาธารณะ$/, "; ใช้พื้นที่ในภาพเป็นจุดเริ่มต้น และตรวจข้อมูลต้นทางก่อนขยายผลไปพื้นที่อื่น")
          .replace(/; ขอบเขตข้อมูลต้นทางนอกพื้นที่ตัวอย่างยังไม่ยืนยัน$/, "; ใช้พื้นที่ในภาพเป็นจุดเริ่มต้น และตรวจข้อมูลต้นทางก่อนขยายผลไปพื้นที่อื่น")
          .replace(/; ([^;]+?)ยังไม่ระบุบนหน้าสาธารณะ$/, "; ก่อนนำไปเทียบพื้นที่ ให้ตรวจ$1จากข้อมูลต้นทาง")
          .replace(/; ([^;]+?)ยังไม่ยืนยัน(?:จากหน้าสาธารณะ)?$/, "; หากต้องใช้$1 ให้ตรวจจากข้อมูลต้นทางก่อน")
          .replace(/; ([^;]+?)ยังไม่เผยแพร่$/, "; เมื่อต้องใช้$1 ให้ตรวจจากข้อมูลต้นทางก่อน")
          .replace(/; ([^;]+?)ยังไม่มีคำอธิบายสาธารณะ$/, "; ก่อนนำไปตัดสินใจ ให้เปิดดู$1");
      } else {
        copy = copy
          .replace(/; source coverage beyond the example is not stated on the public page$/, "; use the example area as a starting point and check the source before extending the finding elsewhere.")
          .replace(/; source coverage beyond the example is not verified$/, "; use the example area as a starting point and check the source before extending the finding elsewhere.")
          .replace(/; ([^;]+?) (?:is|are) not stated on the public page$/, "; check $1 in the source before comparing places.")
          .replace(/; ([^;]+?) (?:is|are) not (?:yet )?verified$/, "; check $1 against the source before relying on it.")
          .replace(/; ([^;]+?) (?:is|are) not (?:yet )?published$/, "; check $1 in the source before relying on it.")
          .replace(/; ([^;]+?) (?:is|are) not publicly documented$/, "; review $1 before making a decision.");
      }
      item.textContent = copy;
    });
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
    }
    if (!record || card.dataset.sourceReviewVersion === "2026-08-14-r4") return;

    const details = card.querySelector(".dataset-details");
    const openLink = card.querySelector(".dataset-open");
    const title = card.querySelector("h3")?.textContent?.trim() || card.id;
    if (!details || !openLink) return;

    card.dataset.sourceStatus = record.status;
    card.dataset.sourceReviewVersion = "2026-08-14-r4";
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

    const evidence = card.querySelector(":scope > .dataset-body > .evidence-summary, :scope > .dataset-body > .dataset-details > .evidence-summary");
    if (evidence) {
      evidence.classList.add("evidence-summary-in-details");
      makeEvidenceActionable(evidence);
    }

    /* The prerendered bundle contains one terse limitation block. The governed
       registry below replaces it with benefit-first copy and concrete checks. */
    details.querySelector(":scope > div:not(.source-review)")?.remove();

    details.querySelector(".source-review")?.remove();
    const review = element("div", "source-review");
    const benefit = makeLabeledCopy(text.benefit, localized(record, "benefit") || localized(record, "reading"));
    benefit.classList.add("source-copy-block-benefit");
    review.append(benefit);
    if (evidence) review.append(evidence);
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

  const supporterAssets = [
    {
      key: "depa",
      path: "media/supporters/depa.png",
      width: 2160,
      height: 1350
    },
    {
      key: "dsure",
      path: "media/supporters/dsure-software.png",
      width: 1014,
      height: 1465
    },
    {
      key: "account",
      path: "media/supporters/digital-service-account.png",
      width: 2298,
      height: 1042
    }
  ];

  function createSupporterLogos(placement) {
    const group = element("div", `supporter-logos supporter-logos-${placement}`);
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", text.supporterLabel);

    for (const asset of supporterAssets) {
      const cell = element("span", `supporter-logo-cell supporter-logo-cell-${asset.key}`);
      const logo = document.createElement("img");
      logo.className = `supporter-logo supporter-logo-${asset.key}`;
      logo.src = `${assetBase}${asset.path}`;
      logo.alt = text.supporterAlt[asset.key];
      logo.width = asset.width;
      logo.height = asset.height;
      logo.decoding = "async";
      if (placement === "footer") logo.loading = "lazy";
      else logo.fetchPriority = "low";
      cell.append(logo);
      group.append(cell);
    }

    return group;
  }

  function enhanceHero() {
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
      qr.src = `${assetBase}media/qr/citymeter-page-${language}.png`;
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

  function enhanceFooterBranding() {
    const footerLead = document.querySelector(".site-footer .footer-grid > div:first-child");
    if (!footerLead) return;
    footerLead.querySelector(".supporter-lockup-footer")?.remove();
    let supporter = footerLead.querySelector(".supporter-logos-footer");
    if (!supporter) {
      supporter = createSupporterLogos("footer");
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

  function waitForHydrationStability() {
    const root = document.getElementById("root") || document.body;
    return new Promise((resolve) => {
      let finished = false;
      let minimumDelayElapsed = false;
      let quietWindowElapsed = false;
      let quietTimer;
      let hardTimer;
      let minimumTimer;

      const observer = new MutationObserver(() => scheduleQuietWindow());

      function finish() {
        if (finished) return;
        finished = true;
        observer.disconnect();
        clearTimeout(quietTimer);
        clearTimeout(hardTimer);
        clearTimeout(minimumTimer);
        resolve();
      }

      function scheduleQuietWindow() {
        quietWindowElapsed = false;
        clearTimeout(quietTimer);
        quietTimer = setTimeout(() => {
          quietWindowElapsed = true;
          if (minimumDelayElapsed) finish();
        }, 250);
      }

      observer.observe(root, { childList: true, subtree: true });
      scheduleQuietWindow();
      minimumTimer = setTimeout(() => {
        minimumDelayElapsed = true;
        if (quietWindowElapsed) finish();
      }, 1000);
      hardTimer = setTimeout(finish, 3000);
    });
  }

  async function start() {
    installResponsiveMotion();
    const enhanceAfterHydration = async () => {
      await waitForHydrationStability();
      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          applyEnhancements();
          new MutationObserver(scheduleEnhancements).observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
          const registryResult = fetch(`${assetBase}data/catalog-source-review.json?v=20260815-performance-clarity-v16`, { cache: "force-cache" }).then(async (response) => {
            if (!response.ok) throw new Error(`Source registry returned ${response.status}`);
            return { registry: await response.json() };
          }).catch((error) => ({ error }));
          const { registry, error } = await registryResult;
          if (error) {
            console.error("CityMETER source-registry enhancements are unavailable", error);
            return;
          }
          recordById = new Map(registry.records.map((record) => [record.id, record]));
          applyEnhancements();
        });
      });
    };

    if (document.readyState === "complete") enhanceAfterHydration();
    else window.addEventListener("load", enhanceAfterHydration, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
