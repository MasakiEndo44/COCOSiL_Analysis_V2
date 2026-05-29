#!/usr/bin/env bash
# finalize-image.sh — Move a generated image from ./images/ into ./images/<category>/
#
# Used by the cocosil-image-gen skill (.claude/skills/cocosil-image-gen/SKILL.md).
# mcp-image cannot write to subdirectories, so files land in ./images/ root and
# must be moved into the category subdirectory immediately after generation.
#
# Usage:
#   ./scripts/finalize-image.sh <category> <filename>
#
# Example:
#   ./scripts/finalize-image.sh icons insight-bulb-20260528.png
#   ./scripts/finalize-image.sh infographic-slides four-system-integration-20260528-02.png

set -euo pipefail

VALID_CATEGORIES=(icons inserts infographics infographic-slides heroes og-bg chat-bg references)

usage() {
  cat >&2 <<EOF
Usage: $0 <category> <filename>

Valid categories: ${VALID_CATEGORIES[*]}

Example:
  $0 icons insight-bulb-20260528.png
  $0 infographic-slides four-system-integration-20260528-02.png
EOF
  exit 1
}

if [[ $# -ne 2 ]]; then
  usage
fi

CATEGORY="$1"
FILENAME="$2"

is_valid=0
for c in "${VALID_CATEGORIES[@]}"; do
  if [[ "$CATEGORY" == "$c" ]]; then
    is_valid=1
    break
  fi
done

if [[ $is_valid -eq 0 ]]; then
  echo "Error: invalid category '$CATEGORY'" >&2
  echo "Valid categories: ${VALID_CATEGORIES[*]}" >&2
  exit 1
fi

SRC="./images/${FILENAME}"
DEST_DIR="./images/${CATEGORY}"
DEST="${DEST_DIR}/${FILENAME}"

if [[ ! -f "$SRC" ]]; then
  echo "Error: source file not found: $SRC" >&2
  echo "Did mcp-image generate '$FILENAME' to ./images/ root?" >&2
  exit 1
fi

if [[ -f "$DEST" ]]; then
  echo "Error: destination already exists: $DEST" >&2
  echo "Use a -NN suffix on the slug to avoid overwriting." >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
mv "$SRC" "$DEST"
echo "Moved: $SRC -> $DEST"
