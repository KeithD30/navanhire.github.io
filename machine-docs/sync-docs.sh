#!/bin/bash
# ============================================
# NHH Machine Docs — Sync & Build Script
# ============================================
# This script:
#   1. Scans all machine folders (named by fleet number)
#   2. Auto-detects the GA1 cert and manual filenames
#   3. Rebuilds machines.json automatically
#   4. (Optional) Syncs public folders to cloud storage
#
# Usage:
#   ./sync-docs.sh
#
# Folder structure expected:
#   <fleet-number>/          e.g. TH042, PA007, etc.
#     public/
#       ga1/       ← drop any PDF in here (any filename)
#       manual/    ← drop any PDF in here (any filename)
#     private/     ← internal docs, never synced
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCS_DIR="$SCRIPT_DIR"
JSON_FILE="$DOCS_DIR/machines.json"

echo ""
echo "=== NHH Machine Docs — Sync ==="
echo "    Scanning: $DOCS_DIR"
echo ""

# Start building machines.json
echo '{' > "$JSON_FILE"
echo '  "machines": [' >> "$JSON_FILE"

first=true

for machine_dir in "$DOCS_DIR"/*/; do
  [ -d "$machine_dir" ] || continue

  # Skip non-machine folders (like hidden dirs, or if sync script is in a subfolder)
  machine_id=$(basename "$machine_dir")
  # Skip if it looks like a system/hidden folder
  [[ "$machine_id" == .* ]] && continue

  public_dir="$machine_dir/public"

  # Skip if no public folder
  if [ ! -d "$public_dir" ]; then
    echo "  SKIP  $machine_id (no public/ folder)"
    continue
  fi

  # Find GA1 cert — first PDF in ga1/ folder
  cert_file=""
  cert_path=""
  if [ -d "$public_dir/ga1" ]; then
    cert_file=$(find "$public_dir/ga1" -maxdepth 1 -type f -iname "*.pdf" | head -1)
    if [ -n "$cert_file" ]; then
      cert_path="$machine_id/public/ga1/$(basename "$cert_file")"
      echo "  ✓ $machine_id  GA1:    $(basename "$cert_file")"
    else
      echo "  ✗ $machine_id  GA1:    NO PDF FOUND in ga1/"
    fi
  fi

  # Find manual — first PDF in manual/ folder
  manual_file=""
  manual_path=""
  if [ -d "$public_dir/manual" ]; then
    manual_file=$(find "$public_dir/manual" -maxdepth 1 -type f -iname "*.pdf" | head -1)
    if [ -n "$manual_file" ]; then
      manual_path="$machine_id/public/manual/$(basename "$manual_file")"
      echo "  ✓ $machine_id  Manual: $(basename "$manual_file")"
    else
      echo "  ✗ $machine_id  Manual: NO PDF FOUND in manual/"
    fi
  fi

  # Read machine-info.txt if it exists (optional metadata)
  machine_name="$machine_id"
  machine_type=""
  machine_serial=""
  cert_expiry=""
  video_url=""

  info_file="$machine_dir/machine-info.txt"
  if [ -f "$info_file" ]; then
    machine_name=$(grep -i "^name:" "$info_file" 2>/dev/null | sed 's/^[Nn]ame:[[:space:]]*//' || echo "$machine_id")
    machine_type=$(grep -i "^type:" "$info_file" 2>/dev/null | sed 's/^[Tt]ype:[[:space:]]*//' || echo "")
    machine_serial=$(grep -i "^serial:" "$info_file" 2>/dev/null | sed 's/^[Ss]erial:[[:space:]]*//' || echo "")
    cert_expiry=$(grep -i "^expiry:" "$info_file" 2>/dev/null | sed 's/^[Ee]xpiry:[[:space:]]*//' || echo "")
    video_url=$(grep -i "^video:" "$info_file" 2>/dev/null | sed 's/^[Vv]ideo:[[:space:]]*//' || echo "")
    [ -z "$machine_name" ] && machine_name="$machine_id"
  fi

  # Add comma before second+ entries
  if [ "$first" = true ]; then
    first=false
  else
    echo '    ,' >> "$JSON_FILE"
  fi

  # Write JSON entry
  cat >> "$JSON_FILE" <<ENTRY
    {
      "id": "$machine_id",
      "name": "$machine_name",
      "type": "$machine_type",
      "serial": "$machine_serial",
      "docs": {
        "cert": "$cert_path",
        "manual": "$manual_path"
      },
      "certExpiry": "$cert_expiry",
      "videoUrl": "$video_url"
    }
ENTRY

done

echo '  ]' >> "$JSON_FILE"
echo '}' >> "$JSON_FILE"

echo ""
echo "  ✓ machines.json rebuilt"
echo ""

# ── Optional: Sync to Cloudflare R2 ──
# Uncomment these lines once you've set up R2:
#
# echo "=== Uploading to Cloudflare R2 ==="
# for machine_dir in "$DOCS_DIR"/*/; do
#   machine_id=$(basename "$machine_dir")
#   public_dir="$machine_dir/public"
#   [ -d "$public_dir" ] || continue
#   find "$public_dir" -type f | while read file; do
#     rel_path="${file#$DOCS_DIR/}"
#     echo "  ↑ $rel_path"
#     wrangler r2 object put "nhh-machine-docs/$rel_path" --file="$file"
#   done
# done
# echo "  ✓ Cloud sync complete"

echo "=== Done ==="
echo ""
