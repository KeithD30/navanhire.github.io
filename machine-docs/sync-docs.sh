#!/bin/bash
# ============================================
# NHH Machine Docs — Bidirectional Sync
# ============================================
# TARGETED sync: only processes machines listed in machine-names.csv
# (SharePoint has 1295 folders — scanning all is too slow because
#  OneDrive Files On-Demand triggers downloads for each one)
#
# Sync modes:
#   DEFAULT   — SharePoint → website (one-way, keeps local files)
#   --mirror  — Full two-way sync with deletion propagation:
#               • SharePoint has file, website doesn't → copy to website
#               • Website has file, SharePoint doesn't → DELETE from website
#               • File deleted from website → DELETE from SharePoint/OneDrive
#               • SharePoint newer → update website copy
#
# SharePoint folder structure (synced via OneDrive):
#   Machines/TELE8N110/public/
#     ga1-cert/          ← GA1 inspection certificate PDF
#     operators-manual/  ← operator manual PDF
#     quick-start-guide-youtube/ ← .url file with YouTube link
#
# Website folder structure:
#   machine-docs/TELE8N110/public/
#     ga1/     ← local copy of GA1 cert
#     manual/  ← local copy of operator manual
#
# Usage:
#   ./sync-docs.sh            # one-way sync (safe — keeps local files)
#   ./sync-docs.sh --mirror   # two-way sync (deletions propagate both ways)
#   ./sync-docs.sh --push     # one-way sync + git commit + push
#   ./sync-docs.sh --mirror --push   # mirror + push
#   ./sync-docs.sh --scan     # list unregistered machines on SharePoint
#
# To add a new machine:
#   1. Add a line to machine-names.csv: FLEET_ID,Display Name,type
#   2. Upload PDFs to SharePoint: Machines/FLEET_ID/public/ga1-cert/
#   3. Run this script
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBSITE_DIR="$(dirname "$SCRIPT_DIR")"
JSON_FILE="$SCRIPT_DIR/machines.json"
NAMES_FILE="$SCRIPT_DIR/machine-names.csv"

# ── Parse flags ──
MIRROR=false
PUSH=false
SCAN=false
for arg in "$@"; do
  case "$arg" in
    --mirror) MIRROR=true ;;
    --push)   PUSH=true ;;
    --scan)   SCAN=true ;;
  esac
done

# ── OneDrive sync folder (SharePoint document library → Mac) ──
ONEDRIVE_MACHINES="$HOME/Library/CloudStorage/OneDrive-SharedLibraries-NavanHire/NHH - Documents/Machines"

echo ""
echo "=== NHH Machine Docs — Sync ==="
if [ "$MIRROR" = true ]; then
  echo "    Mode:    MIRROR (deletions propagate both ways)"
else
  echo "    Mode:    ONE-WAY (local files preserved)"
fi
echo "    Source:  $ONEDRIVE_MACHINES"
echo "    Target:  $SCRIPT_DIR"
echo ""

# Check machine-names.csv exists
if [ ! -f "$NAMES_FILE" ]; then
  echo "  ✗ ERROR: machine-names.csv not found."
  echo "    Expected: $NAMES_FILE"
  echo "    Add machines to sync: FLEET_ID,Display Name,type"
  exit 1
fi

# ── Read machine list from CSV ──
# Format: fleet_id,Display Name,type
# Lines starting with # are comments

# Start building machines.json
echo '{' > "$JSON_FILE"
echo '  "machines": [' >> "$JSON_FILE"

first=true
count=0
synced=0
kept=0
deleted=0
pushed_to_sp=0

while IFS=',' read -r fleet_id machine_name machine_type || [ -n "$fleet_id" ]; do
  # Skip comments and empty lines
  [[ "$fleet_id" =~ ^[[:space:]]*# ]] && continue
  [[ -z "$fleet_id" ]] && continue

  # Trim whitespace
  fleet_id=$(echo "$fleet_id" | xargs)
  machine_name=$(echo "$machine_name" | xargs)
  machine_type=$(echo "$machine_type" | xargs)

  # Use fleet ID as name if blank
  [ -z "$machine_name" ] && machine_name="$fleet_id"

  echo "  ── $fleet_id: $machine_name ──"

  # Create local website folder structure
  local_dir="$SCRIPT_DIR/$fleet_id/public"
  mkdir -p "$local_dir/ga1"
  mkdir -p "$local_dir/manual"

  # SharePoint (OneDrive) paths
  sp_ga1_dir="$ONEDRIVE_MACHINES/$fleet_id/public/ga1-cert"
  sp_manual_dir="$ONEDRIVE_MACHINES/$fleet_id/public/operators-manual"

  # ────────────────────────────────────────────
  # GA1 Certificate
  # ────────────────────────────────────────────
  cert_path=""

  # What's on SharePoint?
  sp_ga1_pdf=""
  if [ -d "$sp_ga1_dir" ]; then
    sp_ga1_pdf=$(ls "$sp_ga1_dir/"*.pdf 2>/dev/null | head -1 || true)
  fi

  # What's on the website?
  local_ga1_pdf=$(ls "$local_dir/ga1/"*.pdf 2>/dev/null | head -1 || true)

  if [ -n "$sp_ga1_pdf" ] && [ -n "$local_ga1_pdf" ]; then
    # BOTH have a file — check if SharePoint is newer
    sp_name=$(basename "$sp_ga1_pdf")
    local_name=$(basename "$local_ga1_pdf")
    if [ "$sp_ga1_pdf" -nt "$local_ga1_pdf" ] || [ "$sp_name" != "$local_name" ]; then
      rm -f "$local_dir/ga1/"*.pdf 2>/dev/null || true
      cp "$sp_ga1_pdf" "$local_dir/ga1/$sp_name"
      echo "  ✓ GA1:    $sp_name (updated from SharePoint)"
      ((synced++)) || true
    else
      echo "  ✓ GA1:    $local_name (up to date)"
    fi
    cert_path="$fleet_id/public/ga1/$(basename "$(ls "$local_dir/ga1/"*.pdf 2>/dev/null | head -1)")"

  elif [ -n "$sp_ga1_pdf" ] && [ -z "$local_ga1_pdf" ]; then
    # SharePoint has it, website doesn't — copy to website
    sp_name=$(basename "$sp_ga1_pdf")
    cp "$sp_ga1_pdf" "$local_dir/ga1/$sp_name"
    cert_path="$fleet_id/public/ga1/$sp_name"
    echo "  ✓ GA1:    $sp_name (synced from SharePoint)"
    ((synced++)) || true

  elif [ -z "$sp_ga1_pdf" ] && [ -n "$local_ga1_pdf" ]; then
    local_name=$(basename "$local_ga1_pdf")
    if [ "$MIRROR" = true ]; then
      # MIRROR: website has it but SharePoint doesn't
      # → Delete from website (SharePoint is source of truth)
      rm -f "$local_dir/ga1/"*.pdf 2>/dev/null || true
      echo "  ✗ GA1:    $local_name (REMOVED — gone from SharePoint)"
      ((deleted++)) || true
    else
      # DEFAULT: keep local file
      cert_path="$fleet_id/public/ga1/$local_name"
      echo "  ✓ GA1:    $local_name (existing local)"
      ((kept++)) || true
    fi

  else
    # Neither has it
    echo "  – GA1:    (no PDF available)"
  fi

  # ────────────────────────────────────────────
  # Operators Manual
  # ────────────────────────────────────────────
  manual_path=""

  sp_manual_pdf=""
  if [ -d "$sp_manual_dir" ]; then
    sp_manual_pdf=$(ls "$sp_manual_dir/"*.pdf 2>/dev/null | head -1 || true)
  fi

  local_manual_pdf=$(ls "$local_dir/manual/"*.pdf 2>/dev/null | head -1 || true)

  if [ -n "$sp_manual_pdf" ] && [ -n "$local_manual_pdf" ]; then
    sp_name=$(basename "$sp_manual_pdf")
    local_name=$(basename "$local_manual_pdf")
    if [ "$sp_manual_pdf" -nt "$local_manual_pdf" ] || [ "$sp_name" != "$local_name" ]; then
      rm -f "$local_dir/manual/"*.pdf 2>/dev/null || true
      cp "$sp_manual_pdf" "$local_dir/manual/$sp_name"
      echo "  ✓ Manual: $sp_name (updated from SharePoint)"
      ((synced++)) || true
    else
      echo "  ✓ Manual: $local_name (up to date)"
    fi
    manual_path="$fleet_id/public/manual/$(basename "$(ls "$local_dir/manual/"*.pdf 2>/dev/null | head -1)")"

  elif [ -n "$sp_manual_pdf" ] && [ -z "$local_manual_pdf" ]; then
    sp_name=$(basename "$sp_manual_pdf")
    cp "$sp_manual_pdf" "$local_dir/manual/$sp_name"
    manual_path="$fleet_id/public/manual/$sp_name"
    echo "  ✓ Manual: $sp_name (synced from SharePoint)"
    ((synced++)) || true

  elif [ -z "$sp_manual_pdf" ] && [ -n "$local_manual_pdf" ]; then
    local_name=$(basename "$local_manual_pdf")
    if [ "$MIRROR" = true ]; then
      rm -f "$local_dir/manual/"*.pdf 2>/dev/null || true
      echo "  ✗ Manual: $local_name (REMOVED — gone from SharePoint)"
      ((deleted++)) || true
    else
      manual_path="$fleet_id/public/manual/$local_name"
      echo "  ✓ Manual: $local_name (existing local)"
      ((kept++)) || true
    fi

  else
    echo "  – Manual: (no PDF available)"
  fi

  # ────────────────────────────────────────────
  # MIRROR: Push local → SharePoint (if file exists locally but not on SP)
  # This handles the case where you add a PDF directly to the website
  # and want it to appear on SharePoint too
  # ────────────────────────────────────────────
  if [ "$MIRROR" = true ] && [ -d "$ONEDRIVE_MACHINES/$fleet_id/public" ]; then

    # Push GA1 cert to SharePoint if local has it but SP doesn't
    local_ga1_now=$(ls "$local_dir/ga1/"*.pdf 2>/dev/null | head -1 || true)
    if [ -n "$local_ga1_now" ] && [ -z "$sp_ga1_pdf" ] && [ -d "$sp_ga1_dir" ]; then
      cp "$local_ga1_now" "$sp_ga1_dir/"
      echo "  ↑ GA1:    $(basename "$local_ga1_now") (pushed TO SharePoint)"
      ((pushed_to_sp++)) || true
    fi

    # Push manual to SharePoint if local has it but SP doesn't
    local_manual_now=$(ls "$local_dir/manual/"*.pdf 2>/dev/null | head -1 || true)
    if [ -n "$local_manual_now" ] && [ -z "$sp_manual_pdf" ] && [ -d "$sp_manual_dir" ]; then
      cp "$local_manual_now" "$sp_manual_dir/"
      echo "  ↑ Manual: $(basename "$local_manual_now") (pushed TO SharePoint)"
      ((pushed_to_sp++)) || true
    fi

    # If a file was deleted locally, remove from SharePoint too
    local_ga1_after=$(ls "$local_dir/ga1/"*.pdf 2>/dev/null | head -1 || true)
    if [ -z "$local_ga1_after" ] && [ -n "$sp_ga1_pdf" ]; then
      rm -f "$sp_ga1_pdf"
      echo "  ↑ GA1:    $(basename "$sp_ga1_pdf") (DELETED from SharePoint)"
      ((deleted++)) || true
    fi

    local_manual_after=$(ls "$local_dir/manual/"*.pdf 2>/dev/null | head -1 || true)
    if [ -z "$local_manual_after" ] && [ -n "$sp_manual_pdf" ]; then
      rm -f "$sp_manual_pdf"
      echo "  ↑ Manual: $(basename "$sp_manual_pdf") (DELETED from SharePoint)"
      ((deleted++)) || true
    fi
  fi

  # ── Quick Start Video URL ──
  video_url=""
  sp_video_dir="$ONEDRIVE_MACHINES/$fleet_id/public/quick-start-guide-youtube"
  if [ -d "$sp_video_dir" ]; then
    url_file=$(ls "$sp_video_dir/"* 2>/dev/null | head -1 || true)
    if [ -n "$url_file" ]; then
      video_url=$(grep -i "^http" "$url_file" 2>/dev/null | head -1 || true)
      if [ -z "$video_url" ]; then
        video_url=$(grep -i "^URL=" "$url_file" 2>/dev/null | sed 's/^URL=//' | head -1 || true)
      fi
      [ -n "$video_url" ] && echo "  ✓ Video:  $video_url"
    fi
  fi

  # ── Write JSON entry ──
  if [ "$first" = true ]; then
    first=false
  else
    echo '    ,' >> "$JSON_FILE"
  fi

  esc_name=$(echo "$machine_name" | sed 's/"/\\"/g')
  cat >> "$JSON_FILE" <<ENTRY
    {
      "id": "$fleet_id",
      "name": "$esc_name",
      "type": "$machine_type",
      "serial": "",
      "docs": {
        "cert": "$cert_path",
        "manual": "$manual_path"
      },
      "certExpiry": "",
      "videoUrl": "$video_url"
    }
ENTRY

  ((count++)) || true
  echo ""

done < "$NAMES_FILE"

echo '  ]' >> "$JSON_FILE"
echo '}' >> "$JSON_FILE"

echo "  ✓ machines.json rebuilt"
echo "    $count machines registered"
echo "    $synced docs synced from SharePoint"
echo "    $kept docs kept from local"
if [ "$MIRROR" = true ]; then
  echo "    $deleted docs deleted (mirror)"
  echo "    $pushed_to_sp docs pushed to SharePoint"
fi
echo ""

# ── Rebuild QR codes CSV from ALL OneDrive folders ──
# This picks up any new fleet items added to SharePoint automatically
QR_CSV="$WEBSITE_DIR/qr-codes-all.csv"
BASE_URL="https://nhh.ie"

if [ -d "$ONEDRIVE_MACHINES" ]; then
  echo "=== Rebuilding QR codes CSV ==="

  # Collect all folder names from OneDrive
  all_ids=()
  for fleet_dir in "$ONEDRIVE_MACHINES"/*/; do
    [ -d "$fleet_dir" ] || continue
    fid=$(basename "$fleet_dir")
    [[ "$fid" == .* ]] && continue
    all_ids+=("$fid")
  done

  # Sort them
  IFS=$'\n' sorted_ids=($(sort <<<"${all_ids[*]}")); unset IFS

  # Write CSV header
  echo "Stock Number,QR URL,Has GA1,Has Manual" > "$QR_CSV"

  new_count=0
  for fid in "${sorted_ids[@]}"; do
    # URL-encode the ID (spaces → %20)
    encoded_id=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$fid'))" 2>/dev/null || echo "$fid")
    url="${BASE_URL}/machine.html?id=${encoded_id}"

    # Check for GA1 cert
    has_ga1="No"
    sp_ga1="$ONEDRIVE_MACHINES/$fid/public/ga1-cert"
    if [ -d "$sp_ga1" ]; then
      if ls "$sp_ga1/"*.pdf >/dev/null 2>&1; then
        has_ga1="Yes"
      fi
    fi
    # Also check local copy
    local_ga1="$SCRIPT_DIR/$fid/public/ga1"
    if [ "$has_ga1" = "No" ] && [ -d "$local_ga1" ]; then
      if ls "$local_ga1/"*.pdf >/dev/null 2>&1; then
        has_ga1="Yes"
      fi
    fi

    # Check for manual
    has_manual="No"
    sp_manual="$ONEDRIVE_MACHINES/$fid/public/operators-manual"
    if [ -d "$sp_manual" ]; then
      if ls "$sp_manual/"*.pdf >/dev/null 2>&1; then
        has_manual="Yes"
      fi
    fi
    local_manual="$SCRIPT_DIR/$fid/public/manual"
    if [ "$has_manual" = "No" ] && [ -d "$local_manual" ]; then
      if ls "$local_manual/"*.pdf >/dev/null 2>&1; then
        has_manual="Yes"
      fi
    fi

    echo "$fid,$url,$has_ga1,$has_manual" >> "$QR_CSV"
    ((new_count++)) || true
  done

  echo "  ✓ qr-codes-all.csv rebuilt ($new_count items)"

  # Rebuild portable print file
  if [ -f "$WEBSITE_DIR/build-portable.py" ]; then
    echo "  → Rebuilding portable print file..."
    (cd "$WEBSITE_DIR" && python3 build-portable.py) && echo "  ✓ qr-print-portable.html rebuilt" || echo "  ✗ Portable rebuild failed"
  fi
  echo ""
fi

# ── Optional: Scan for unregistered machines ──
if [ "$SCAN" = true ] && [ -d "$ONEDRIVE_MACHINES" ]; then
  echo "=== Unregistered machines on SharePoint ==="
  for fleet_dir in "$ONEDRIVE_MACHINES"/*/; do
    [ -d "$fleet_dir" ] || continue
    fid=$(basename "$fleet_dir")
    [[ "$fid" == .* ]] && continue
    [ -d "$fleet_dir/public" ] || continue
    # Check if it's in the CSV
    if ! grep -q "^${fid}," "$NAMES_FILE" 2>/dev/null; then
      echo "  $fid"
    fi
  done
  echo ""
fi

# ── Optional: Push to GitHub Pages ──
if [ "$PUSH" = true ]; then
  echo "=== Pushing to GitHub Pages ==="
  cd "$WEBSITE_DIR"
  git add machine-docs/ qr-codes-all.csv qr-print-portable.html qr-print-all.html
  git commit -m "Sync machine documents $(date +%Y-%m-%d)" 2>/dev/null || echo "  (no changes to commit)"
  git push 2>/dev/null && echo "  ✓ Pushed to GitHub" || echo "  ✗ Push failed — check git remote"
  echo ""
fi

echo "=== Done ==="
echo ""
