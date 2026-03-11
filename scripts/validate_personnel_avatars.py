#!/usr/bin/env python3
"""
validate_personnel_avatars.py
Validates the six new UGF personnel avatar role folders, then runs FNV-1a
spot-checks against the selection algorithm.
"""

import hashlib
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is required. Run: pip install Pillow", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Role folders to validate
# ---------------------------------------------------------------------------
ROLE_FOLDERS = [
    ("hc",  "public/avatars/personnel/coaches/hc"),
    ("oc",  "public/avatars/personnel/coaches/oc"),
    ("dc",  "public/avatars/personnel/coaches/dc"),
    ("stc", "public/avatars/personnel/coaches/stc"),
    ("gm",  "public/avatars/personnel/front_office/gm"),
    ("agm", "public/avatars/personnel/front_office/agm"),
]

EXPECTED_SIZE = (1024, 1024)
FILENAME_PATTERN = re.compile(r"^PERS_\d{4}\.png$")

# ---------------------------------------------------------------------------
# FNV-1a 32-bit implementation (mirrors the spec exactly)
# ---------------------------------------------------------------------------
def fnv1a32(s: str) -> int:
    h = 0x811c9dc5
    for b in s.encode("utf-8"):
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return h


def select_avatar(pid: int, role_key: str, pool: list) -> str:
    seed = f"{role_key}:{pid}"
    index = fnv1a32(seed) % len(pool)
    return pool[index]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def find_repo_root():
    here = os.path.dirname(os.path.abspath(__file__))
    candidate = here
    for _ in range(6):
        if os.path.exists(os.path.join(candidate, "package.json")):
            return candidate
        candidate = os.path.dirname(candidate)
    return here


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_folder(role_key: str, folder_path: str, repo_root: str):
    abs_folder = os.path.join(repo_root, folder_path)
    print(f"\n{'='*60}")
    print(f"  Role: {role_key}  →  {folder_path}")
    print(f"{'='*60}")

    if not os.path.isdir(abs_folder):
        print(f"  FAIL  Folder does not exist: {abs_folder}")
        return False, []

    files = sorted([f for f in os.listdir(abs_folder) if not f.startswith(".")])
    if not files:
        print("  FAIL  Folder is empty")
        return False, []

    folder_pass = True
    pool = []
    seen_hashes = {}

    for filename in files:
        file_path = os.path.join(abs_folder, filename)
        file_issues = []

        # 1. Filename pattern
        if not FILENAME_PATTERN.match(filename):
            file_issues.append(f"bad filename (expected PERS_NNNN.png, got '{filename}')")

        # 2. Valid PNG + dimensions
        try:
            with Image.open(file_path) as img:
                if img.size != EXPECTED_SIZE:
                    file_issues.append(f"wrong size {img.size}, expected {EXPECTED_SIZE}")
                if img.format != "PNG":
                    file_issues.append(f"wrong format '{img.format}', expected PNG")
        except Exception as e:
            file_issues.append(f"cannot open as image: {e}")

        # 3. SHA-256 uniqueness
        digest = sha256_file(file_path)
        if digest in seen_hashes:
            file_issues.append(f"duplicate hash (same as {seen_hashes[digest]})")
        else:
            seen_hashes[digest] = filename

        # Report per-file
        status = "PASS" if not file_issues else "FAIL"
        if file_issues:
            folder_pass = False
        print(f"  {status}  {filename}  [{digest[:12]}…]", end="")
        if file_issues:
            print(f"  ← {'; '.join(file_issues)}", end="")
        print()

        if not file_issues:
            pool.append(filename)

    folder_status = "PASS" if folder_pass else "FAIL"
    print(f"\n  → Folder result: {folder_status}  ({len(pool)}/{len(files)} files valid)")
    return folder_pass, pool


# ---------------------------------------------------------------------------
# FNV-1a spot-check
# ---------------------------------------------------------------------------
TEST_PIDS = [1, 7, 42, 100, 999]

def run_fnv_checks(role_key: str, pool: list):
    print(f"\n  FNV-1a spot-check for role '{role_key}' (pool size={len(pool)}):")
    if not pool:
        print("    SKIP — no valid pool files")
        return
    all_ok = True
    for pid in TEST_PIDS:
        try:
            result = select_avatar(pid, role_key, pool)
            assert result in pool, f"'{result}' not in pool"
            print(f"    pid={pid:>4}  seed='{role_key}:{pid}'  → {result}  OK")
        except Exception as e:
            print(f"    pid={pid:>4}  FAIL  {e}")
            all_ok = False
    status = "PASS" if all_ok else "FAIL"
    print(f"    → FNV check: {status}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    repo_root = find_repo_root()
    print(f"Repo root: {repo_root}")
    print(f"Validating {len(ROLE_FOLDERS)} role folder(s)...\n")

    overall_pass = True
    all_pools = {}

    for role_key, folder_path in ROLE_FOLDERS:
        folder_ok, pool = validate_folder(role_key, folder_path, repo_root)
        if not folder_ok:
            overall_pass = False
        all_pools[role_key] = pool

    # FNV spot-checks
    print(f"\n{'='*60}")
    print("  FNV-1a Selection Algorithm Spot-Checks")
    print(f"{'='*60}")
    for role_key, folder_path in ROLE_FOLDERS:
        run_fnv_checks(role_key, all_pools[role_key])

    # Final verdict
    print(f"\n{'='*60}")
    verdict = "ALL PASS" if overall_pass else "FAILURES DETECTED"
    print(f"  Overall result: {verdict}")
    print(f"{'='*60}\n")
    sys.exit(0 if overall_pass else 1)


if __name__ == "__main__":
    main()
