#!/usr/bin/env bash
# Build and upload the static app to a Hugging Face Space.
set -euo pipefail

SPACE_ID="${HF_SPACE_ID:-adameubanks/embeddings-over-time}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

echo "Building for Hugging Face Space (base /)..."
npm run build:hf

echo "Copying Space README..."
cp space/README.md dist-hf/README.md

echo "Ensuring Space exists (static SDK): $SPACE_ID"
hf repos create "$SPACE_ID" --type space --space-sdk static --exist-ok

echo "Uploading dist-hf (~566MB embeddings, may take several minutes)..."
# upload-large-folder omits space_sdk on create_repo and fails for Spaces; hf upload works
# once the static Space repo already exists (see huggingface_hub issue).
hf upload "$SPACE_ID" dist-hf . --repo-type space \
  --exclude ".cache/**" \
  --commit-message "Deploy Embeddings Over Time explorer"

echo "Done. Space URL: https://huggingface.co/spaces/${SPACE_ID}"
