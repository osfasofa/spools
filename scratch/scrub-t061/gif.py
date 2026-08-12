# T-061: assemble record.mjs's PNG frames into the README GIF.
# Consecutive identical frames collapse into longer durations, so the holds
# cost nothing. Usage: python3 gif.py <frames-dir> <out.gif>
import sys
from pathlib import Path
from PIL import Image

frames_dir, out = Path(sys.argv[1]), sys.argv[2]
paths = sorted(frames_dir.glob("f*.png"))
if not paths:
    sys.exit("no frames")

FRAME_MS = 110
WIDTH = 640

frames, durations = [], []
prev_bytes = None
for p in paths:
    im = Image.open(p).convert("RGB")
    im = im.resize((WIDTH, int(im.height * WIDTH / im.width)), Image.LANCZOS)
    b = im.tobytes()
    if b == prev_bytes:
        durations[-1] += FRAME_MS  # a hold: stretch the previous frame
        continue
    prev_bytes = b
    frames.append(im.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG))
    durations.append(FRAME_MS)

frames[0].save(
    out,
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=0,
    optimize=True,
)
total_s = sum(durations) / 1000
print(f"{out}: {len(frames)} frames, {total_s:.1f}s, {Path(out).stat().st_size / 1024:.0f} KB")
