import QRCode from "qrcode";

// A static, local vector with a four-module quiet zone. The backplate retains
// the same approved light foundation colors in either surrounding theme.
export function datasetQr(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "landometer.com")
    throw new Error("A dataset QR must target the approved CityMETER service");
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  const size = modules.size + 8;
  const cells = [];
  for (let y = 0; y < modules.size; y++)
    for (let x = 0; x < modules.size; x++)
      if (modules.get(y, x)) cells.push(`M${x + 4},${y + 4}h1v1h-1z`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="256" height="256" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#FCFCFA"/><path fill="#182327" d="${cells.join("")}"/></svg>\n`;
}
