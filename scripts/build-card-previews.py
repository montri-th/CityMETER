#!/usr/bin/env python3
"""Build the immutable CityMETER card-preview set.

This intentionally creates only presentation thumbnails. The approved 1200x750
evidence captures in media/previews-v2 remain unchanged.
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

import PIL
from PIL import Image, features


EXPECTED_PILLOW = "12.3.0"
EXPECTED_WEBP = "1.6.0"
WIDTH = 800
HEIGHT = 500
QUALITY = 75
METHOD = 6
REVISION = "2026-08-16-preview-v3"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fail(message: str) -> None:
    raise SystemExit(message)


def main() -> None:
    if PIL.__version__ != EXPECTED_PILLOW:
        fail(f"Pillow {EXPECTED_PILLOW} is required; found {PIL.__version__}")
    webp_version = features.version("webp")
    if not features.check("webp") or webp_version != EXPECTED_WEBP:
        fail(f"libwebp {EXPECTED_WEBP} is required; found {webp_version or 'unavailable'}")

    root = Path(__file__).resolve().parent.parent
    source_dir = root / "media" / "previews-v2"
    output_dir = root / "media" / "previews-v3"
    source_files = sorted(source_dir.glob("*.webp"))
    if len(source_files) != 38:
        fail(f"Expected 38 source previews, found {len(source_files)}")

    output_dir.mkdir(parents=True, exist_ok=True)
    expected_names = {path.name for path in source_files}
    unexpected = sorted(path.name for path in output_dir.glob("*.webp") if path.name not in expected_names)
    if unexpected:
        fail("Unexpected generated previews: " + ", ".join(unexpected))

    records: list[dict[str, object]] = []
    source_total = 0
    output_total = 0
    for source_path in source_files:
        with Image.open(source_path) as source_image:
            if source_image.size != (1200, 750):
                fail(f"{source_path.name} must be 1200x750; found {source_image.size}")
            image = source_image.convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

        output_path = output_dir / source_path.name
        image.save(
            output_path,
            "WEBP",
            quality=QUALITY,
            method=METHOD,
            lossless=False,
        )
        with Image.open(output_path) as check_image:
            if check_image.size != (WIDTH, HEIGHT) or check_image.mode != "RGB":
                fail(f"Generated preview contract failed for {output_path.name}")

        source_bytes = source_path.stat().st_size
        output_bytes = output_path.stat().st_size
        source_total += source_bytes
        output_total += output_bytes
        records.append(
            {
                "name": source_path.name,
                "sourceBytes": source_bytes,
                "sourceSha256": sha256(source_path),
                "outputBytes": output_bytes,
                "outputSha256": sha256(output_path),
                "width": WIDTH,
                "height": HEIGHT,
            }
        )

    manifest = {
        "revision": REVISION,
        "sourceDirectory": "media/previews-v2",
        "outputDirectory": "media/previews-v3",
        "generator": {
            "script": "scripts/build-card-previews.py",
            "pillow": EXPECTED_PILLOW,
            "libwebp": EXPECTED_WEBP,
            "width": WIDTH,
            "height": HEIGHT,
            "quality": QUALITY,
            "method": METHOD,
            "resampling": "LANCZOS",
        },
        "totals": {
            "files": len(records),
            "sourceBytes": source_total,
            "outputBytes": output_total,
            "reductionPercent": round((1 - output_total / source_total) * 100, 1),
        },
        "files": records,
    }
    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "status": "built",
                "revision": REVISION,
                "files": len(records),
                "sourceBytes": source_total,
                "outputBytes": output_total,
                "reductionPercent": manifest["totals"]["reductionPercent"],
                "manifest": str(manifest_path.relative_to(root)),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.exit(1)
