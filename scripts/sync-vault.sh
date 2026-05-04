#!/bin/bash
# Sync Obsidian Vault contents into ./content/ for the Next.js app to consume.
# Configurable via VAULT_PATH env var; falls back to ~/Documents/Obsidian Vault.

set -e

VAULT_PATH="${VAULT_PATH:-$HOME/Documents/Obsidian Vault}"
CONTENT_PATH="$(cd "$(dirname "$0")/.." && pwd)/content"

if [ ! -d "$VAULT_PATH" ]; then
  echo "[sync-vault] Vault not found at: $VAULT_PATH"
  echo "[sync-vault] Skipping sync. Set VAULT_PATH to your Obsidian Vault path."
  mkdir -p "$CONTENT_PATH"
  exit 0
fi

echo "[sync-vault] Source: $VAULT_PATH"
echo "[sync-vault] Dest:   $CONTENT_PATH"

mkdir -p "$CONTENT_PATH"

# Use rsync --delete instead of `rm -rf` first; safer in environments where
# the destination tree was created with stricter permissions.
rsync -a --delete \
  --exclude='_templates' \
  --exclude='_attachments' \
  --exclude='raw' \
  --exclude='.obsidian' \
  --exclude='.obsidian/**' \
  --exclude='.git' \
  --exclude='.git/**' \
  --exclude='.claude' \
  --exclude='.trash' \
  --exclude='.gitignore' \
  --exclude='.DS_Store' \
  "$VAULT_PATH/" "$CONTENT_PATH/"

COUNT=$(find "$CONTENT_PATH" -name "*.md" -type f | wc -l | tr -d ' ')
echo "[sync-vault] Done. ${COUNT} markdown files synced to $CONTENT_PATH"
