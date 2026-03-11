#!/usr/bin/env python3
"""
generate_personnel_avatars.py
Generates deterministic placeholder avatar PNGs for UGF personnel roles.

Usage:
  python scripts/generate_personnel_avatars.py --count 10
  python scripts/generate_personnel_avatars.py --role hc --count 5
"""

import argparse
import colorsys
import math
import os
import struct
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow is required. Run: pip install Pillow", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Role definitions
# ---------------------------------------------------------------------------
ROLES = [
    {
        "role_key": "hc",
        "label": "HC",
        "folder": "public/avatars/personnel/coaches/hc",
        "bg_hex": "#1a2035",
        "accent_hex": "#60a5fa",
    },
    {
        "role_key": "oc",
        "label": "OC",
        "folder": "public/avatars/personnel/coaches/oc",
        "bg_hex": "#1a2d1a",
        "accent_hex": "#4ade80",
    },
    {
        "role_key": "dc",
        "label": "DC",
        "folder": "public/avatars/personnel/coaches/dc",
        "bg_hex": "#2d1a1a",
        "accent_hex": "#f87171",
    },
    {
        "role_key": "stc",
        "label": "STC",
        "folder": "public/avatars/personnel/coaches/stc",
        "bg_hex": "#2d2a1a",
        "accent_hex": "#fbbf24",
    },
    {
        "role_key": "gm",
        "label": "GM",
        "folder": "public/avatars/personnel/front_office/gm",
        "bg_hex": "#1a1a2d",
        "accent_hex": "#a78bfa",
    },
    {
        "role_key": "agm",
        "label": "AGM",
        "folder": "public/avatars/personnel/front_office/agm",
        "bg_hex": "#1a2d2d",
        "accent_hex": "#2dd4bf",
    },
]

SIZE = 1024
CIRCLE_BASE_RADIUS = 300
STROKE_WIDTH = 8


# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------
def hex_to_rgba(h: str, alpha: int = 255):
    h = h.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (r, g, b, alpha)


def shift_hue(rgba, delta_hue_deg: float):
    """Return rgba with hue rotated by delta_hue_deg degrees."""
    r, g, b, a = rgba
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h = (h + delta_hue_deg / 360) % 1.0
    nr, ng, nb = colorsys.hsv_to_rgb(h, s, v)
    return (int(nr * 255), int(ng * 255), int(nb * 255), a)


# ---------------------------------------------------------------------------
# Font helpers
# ---------------------------------------------------------------------------
def best_font(size: int) -> ImageFont.ImageFont:
    """Return the largest usable truetype font at `size` px, or the default."""
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    # Fall back to PIL default (no size arg)
    return ImageFont.load_default()


# ---------------------------------------------------------------------------
# Avatar generation
# ---------------------------------------------------------------------------
def generate_avatar(
    label: str,
    bg_hex: str,
    accent_hex: str,
    index: int,
) -> Image.Image:
    """
    Generate one 1024×1024 RGBA avatar.

    Variation per index:
      - Background hue is rotated ±5° (deterministic, no randomness)
      - Circle radius varies ±20px
      - Label font size varies ±16px
      - Outer ring alpha varies
    """
    # Deterministic per-index deltas — no random calls
    hue_delta = ((index % 5) - 2) * 2.5          # -5, -2.5, 0, +2.5, +5 deg
    radius_delta = ((index % 7) - 3) * 6          # -18 … +18 px
    font_size_delta = ((index % 3) - 1) * 8       # -8, 0, +8 px
    ring_alpha = 200 + (index % 5) * 11           # 200–244

    bg_rgba = hex_to_rgba(bg_hex)
    accent_rgba = hex_to_rgba(accent_hex)

    # Shift background hue slightly
    bg_shifted = shift_hue(bg_rgba, hue_delta)

    img = Image.new("RGBA", (SIZE, SIZE), bg_shifted)
    draw = ImageDraw.Draw(img)

    cx, cy = SIZE // 2, SIZE // 2
    radius = CIRCLE_BASE_RADIUS + radius_delta

    # Outer filled circle (slightly dimmed background colour → subtle disc)
    disc_color = (
        min(255, bg_shifted[0] + 20),
        min(255, bg_shifted[1] + 20),
        min(255, bg_shifted[2] + 20),
        255,
    )
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=disc_color,
    )

    # Accent ring (stroke)
    ring_accent = (*accent_rgba[:3], ring_alpha)
    for t in range(STROKE_WIDTH):
        r_off = radius - t
        draw.ellipse(
            [cx - r_off, cy - r_off, cx + r_off, cy + r_off],
            outline=ring_accent,
        )

    # Inner accent decoration — thin second ring
    inner_r = int(radius * 0.72)
    inner_alpha = max(60, ring_alpha - 80)
    inner_ring = (*accent_rgba[:3], inner_alpha)
    for t in range(3):
        r_off = inner_r - t
        draw.ellipse(
            [cx - r_off, cy - r_off, cx + r_off, cy + r_off],
            outline=inner_ring,
        )

    # Label text
    font_size = 180 + font_size_delta
    if len(label) >= 3:
        font_size = int(font_size * 0.72)
    font = best_font(font_size)

    # Measure text and center it
    bbox = draw.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw // 2 - bbox[0]
    ty = cy - th // 2 - bbox[1]
    draw.text((tx, ty), label, font=font, fill=(*accent_rgba[:3], 255))

    return img


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def parse_args():
    p = argparse.ArgumentParser(description="Generate UGF personnel placeholder avatars")
    p.add_argument("--role", default=None, help="Single role key (hc|oc|dc|stc|gm|agm)")
    p.add_argument("--count", type=int, default=10, help="Avatars per role (default: 10)")
    p.add_argument(
        "--out-root",
        default=None,
        help="Override output root dir (default: repo root, auto-detected)",
    )
    return p.parse_args()


def find_repo_root():
    """Walk up from this script to find the repo root (contains package.json)."""
    here = os.path.dirname(os.path.abspath(__file__))
    candidate = here
    for _ in range(6):
        if os.path.exists(os.path.join(candidate, "package.json")):
            return candidate
        candidate = os.path.dirname(candidate)
    # Fallback: parent of scripts/
    return here


def main():
    args = parse_args()

    repo_root = args.out_root or find_repo_root()

    roles_to_gen = ROLES
    if args.role:
        roles_to_gen = [r for r in ROLES if r["role_key"] == args.role]
        if not roles_to_gen:
            print(f"ERROR: Unknown role key '{args.role}'. Valid keys: {[r['role_key'] for r in ROLES]}", file=sys.stderr)
            sys.exit(1)

    count = max(1, args.count)

    print(f"Generating {count} avatar(s) for {len(roles_to_gen)} role(s)...\n")

    summary_rows = []

    for role in roles_to_gen:
        out_dir = os.path.join(repo_root, role["folder"])
        os.makedirs(out_dir, exist_ok=True)

        files_written = []
        for i in range(1, count + 1):
            filename = f"PERS_{i:04d}.png"
            out_path = os.path.join(out_dir, filename)
            img = generate_avatar(
                label=role["label"],
                bg_hex=role["bg_hex"],
                accent_hex=role["accent_hex"],
                index=i,
            )
            img.save(out_path, format="PNG")
            files_written.append(out_path)

        sizes = [os.path.getsize(p) for p in files_written]
        size_range = f"{min(sizes):,}–{max(sizes):,} bytes"
        summary_rows.append((role["role_key"], role["folder"], len(files_written), size_range))
        print(f"  [{role['role_key']:>3}]  {len(files_written)} files → {out_dir}")

    print("\n--- Summary ---")
    header = f"{'Role':<6}  {'Folder':<42}  {'Files':>5}  {'Size range'}"
    print(header)
    print("-" * len(header))
    for rk, folder, n, sr in summary_rows:
        print(f"{rk:<6}  {folder:<42}  {n:>5}  {sr}")
    print()
    print("Done.")


if __name__ == "__main__":
    main()
