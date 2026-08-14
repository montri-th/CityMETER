#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ffmpeg -y \
  -loop 1 -t 3.50 -i media/reel/hero-scenes/01-population.webp \
  -loop 1 -t 3.50 -i media/reel/hero-scenes/02-building.webp \
  -loop 1 -t 3.50 -i media/reel/hero-scenes/03-municipality.webp \
  -loop 1 -t 3.50 -i media/reel/hero-scenes/04-tourism.webp \
  -filter_complex "[0:v]fps=24,scale=1280:720,setsar=1,format=yuv420p[v0];[1:v]fps=24,scale=1280:720,setsar=1,format=yuv420p[v1];[2:v]fps=24,scale=1280:720,setsar=1,format=yuv420p[v2];[3:v]fps=24,scale=1280:720,setsar=1,format=yuv420p[v3];[v0][v1]xfade=transition=fade:duration=0.35:offset=3.15[x1];[x1][v2]xfade=transition=fade:duration=0.35:offset=6.30[x2];[x2][v3]xfade=transition=fade:duration=0.35:offset=9.45,trim=duration=12.958333,setpts=PTS-STARTPTS[out]" \
  -map "[out]" -an -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 18 \
  -movflags +faststart -pix_fmt yuv420p media/reel/citymeter-proof-v3-exhibition.mp4

ffmpeg -y -i media/reel/citymeter-proof-v3-exhibition.mp4 \
  -vf "scale=960:540:flags=lanczos" -an -c:v libx264 -profile:v high -level 4.0 \
  -preset slow -crf 22 -movflags +faststart -pix_fmt yuv420p \
  media/reel/citymeter-proof-v3.mp4
