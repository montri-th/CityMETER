import { uiIcon } from "./ui-icon.mjs";
import { readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const social = readJson("../../data/public-footer-social.json");
const icons = readJson("../../assets/brand/icons/icon-set.json");
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Exact outline artwork from the reviewed public Landom footer reference. */
export function socialIcon(platform) {
  const item = social.find((entry) => entry.label.toLowerCase() === String(platform).toLowerCase());
  if (!item) throw new Error(`Unsupported public social icon: ${platform}`);
  return item.svg;
}

/** Shared approved portfolio identity; no invented CityMETER product icon. */
export function faviconHead(assetBase) {
  return icons.files.filter((item) => ["favicon", "apple-touch"].includes(item.role)).map((item) => `<link rel="${item.role === "apple-touch" ? "apple-touch-icon" : "icon"}" type="image/png" sizes="${item.sizePx}x${item.sizePx}" href="${esc(assetBase)}assets/brand/icons/${esc(item.file)}">`).join("\n");
}

const copy = {
  th: {
    description: "มองเมืองให้เข้าใจ แล้วนำข้อมูลไปใช้กับเรื่องที่สำคัญกับคุณ",
    address: "23/34-35 Room 4C-4D 4th Fl. The Quarter Bangkok Tower, ถนนตรีมิตร แขวงตลาดน้อย เขตสัมพันธวงศ์ กรุงเทพมหานคร 10100",
    office: "เปิดแผนที่สำนักงาน", social: "ช่องทางสังคมของ Landometer", links: "ลิงก์ท้ายหน้า",
    catalog: "ข้อมูล CityMETER", back: "กลับไปดูข้อมูลรายการนี้", top: "กลับไปด้านบน", map: "เปิดใน CityMETER", people: "ชาว Landom",
    supported: "ได้รับการส่งเสริมและสนับสนุนโดย depa", marks: "การสนับสนุนและเครื่องหมายโครงการที่ได้รับจาก depa", account: "บัญชีบริการดิจิทัล",
  },
  en: {
    description: "Understand a place. Put its data to work on the decisions that matter to you.",
    address: "23/34-35 Room 4C-4D 4th Fl. The Quarter Bangkok Tower, Tri Mit Road, Talat Noi, Samphanthawong, Bangkok 10100, Thailand",
    office: "Open office map", social: "Landometer social profiles", links: "Footer links",
    catalog: "CityMETER data", back: "Back to this data view", top: "Back to top", map: "Open in CityMETER", people: "People of Landom",
    supported: "Promoted and supported by depa", marks: "Support and programme marks received from depa", account: "Digital Service Account",
  },
};

/** Complete footer, reused unchanged in initial HTML and the React footer owner. */
export function publicFooter(lang, assetBase, { kind = "catalog", mapUrl, slug } = {}) {
  if (!copy[lang] || !["catalog", "summary"].includes(kind)) throw new Error("Unsupported public footer context");
  if (mapUrl && new URL(mapUrl).protocol !== "https:") throw new Error("Public map links must use HTTPS");
  const t = copy[lang];
  const catalogPath = `${assetBase}${lang === "en" ? "en/" : ""}`;
  const back = kind === "summary" && slug ? `${catalogPath}#dataset-${encodeURIComponent(slug)}` : `${catalogPath}#datasets`;
  const asset = (path) => esc(assetBase + path);
  return `<footer class="cm-public-footer" aria-labelledby="cm-footer-title">
<div class="cm-footer-main">
  <div class="cm-footer-contact">
    <p class="cm-footer-label">Landometer Co., Ltd.</p>
    <h2 id="cm-footer-title" lang="en">Let us cultivate our city with data.</h2>
    <p class="cm-footer-copy">${esc(t.description)}</p>
    <address>${esc(t.address)}</address>
    <a class="cm-footer-map" href="https://maps.app.goo.gl/8DQPVMtPdxWMBoZU9" target="_blank" rel="noopener noreferrer"><span class="cm-footer-map-icon" aria-hidden="true">${uiIcon("map")}</span><span>${t.office}</span>${uiIcon("open_in_new", { size: 20 })}<img class="cm-footer-slice" src="${asset("assets/landometer/svg/slice-quiet-gray.svg")}" alt="" width="42" height="28" loading="lazy"></a>
  </div>
  <div class="cm-footer-connect">
    <img class="cm-footer-cultivate" src="${asset("assets/landometer/svg/cultivate-quiet-gray.svg")}" alt="" width="260" height="130" loading="lazy">
    <a class="cm-footer-email" href="mailto:hello@landometer.com">hello@landometer.com</a>
    <nav class="cm-footer-social" aria-label="${t.social}">${social.map((item) => `<a href="${esc(item.href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(item.label)}" title="${esc(item.label)}">${socialIcon(item.label)}</a>`).join("")}</nav>
    <nav class="cm-footer-links" aria-label="${t.links}"><a href="${esc(back)}">${kind === "summary" ? t.back : t.catalog}</a>${kind === "summary" && mapUrl ? `<a href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">${t.map}${uiIcon("open_in_new", { size: 20 })}</a>` : `<a href="#top">${t.top}</a>`}<a href="https://montri-th.github.io/Landom/${lang === "en" ? "en/" : ""}">${t.people}</a><a href="https://landometer.com/pdpa/showDocVer" target="_blank" rel="noopener noreferrer">Privacy &amp; Terms</a></nav>
  </div>
</div>
<div class="cm-footer-support"><p>${t.supported}</p><div class="cm-footer-supporter-marks" role="group" aria-label="${t.marks}"><img src="${asset("media/supporters/depa.png")}" alt="depa" width="2160" height="1350" loading="lazy" decoding="async"><img src="${asset("media/supporters/dsure-software.png")}" alt="dSURE Software" width="1014" height="1465" loading="lazy" decoding="async"><img src="${asset("media/supporters/digital-service-account.png")}" alt="${t.account}" width="2298" height="1042" loading="lazy" decoding="async"></div></div>
<div class="cm-footer-bottom"><div class="cm-footer-bottom-inner"><a class="cm-footer-brand" href="https://landometer.com" aria-label="Landometer"><img src="${asset("assets/brand/landometer-horizontal.png")}" width="168" height="47" alt="Landometer" loading="lazy"></a><p>© 2017–2026 Landometer Co., Ltd.</p><p class="cm-footer-property">CityMETER</p></div></div>
</footer>`;
}
