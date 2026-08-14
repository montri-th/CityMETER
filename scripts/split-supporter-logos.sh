#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
source_png="${repo_root}/media/depa-dsure-tdc-lockup.png"
output_dir="${repo_root}/media/supporters"
expected_source_size="6541x1561"
expected_source_sha="804506f124cdb55dc14918b6eb64f7c2bd9badd29fc33fcfddeee5b62b07932c"

if command -v magick >/dev/null 2>&1; then
  image_command=(magick)
elif command -v convert >/dev/null 2>&1; then
  image_command=(convert)
else
  printf '%s\n' "ImageMagick is required to split the supporter logos." >&2
  exit 1
fi

actual_source_size="$(identify -format '%wx%h' "${source_png}")"
actual_source_sha="$(sha256sum "${source_png}" | awk '{print $1}')"
if [[ "${actual_source_size}" != "${expected_source_size}" || "${actual_source_sha}" != "${expected_source_sha}" ]]; then
  printf '%s\n' "Supporter source does not match the approved 6541x1561 owner PNG." >&2
  exit 1
fi

mkdir -p "${output_dir}"

# Crop only. The source already contains a real alpha channel. Global white
# removal would damage enclosed white details in the dSURE and TDC marks.
"${image_command[@]}" "${source_png}" -crop 2160x1350+178+106 +repage -strip -define png:exclude-chunks=date,time PNG32:"${output_dir}/depa.png"
"${image_command[@]}" "${source_png}" -crop 1014x1465+2817+18 +repage -strip -define png:exclude-chunks=date,time PNG32:"${output_dir}/dsure-software.png"
"${image_command[@]}" "${source_png}" -crop 2298x1042+4006+260 +repage -strip -define png:exclude-chunks=date,time PNG32:"${output_dir}/digital-service-account.png"

identify -format '%f %wx%h channels=%[channels] opaque=%[opaque]\n' "${output_dir}"/*.png
