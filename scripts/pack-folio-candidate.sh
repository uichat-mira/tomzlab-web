#!/usr/bin/env bash
# Assemble a reproducible *test-only* Folio dev package while the public JSON
# subscription Hook (#195) remains independent from merged native list API (#196).
set -euo pipefail
src="${1:?Expected checked-out Folio source path}"
destination="${2:?Expected package output directory}"
dev_sha='2d123baf8f76c22ad1bac53b779359e9c66583fc'
subscription_sha='c012ea6d1d995dd1c18c75855b7e9a4a8e8d1b74'
test "$(git -C "$src" rev-parse HEAD)" = "$dev_sha"
git -C "$src" fetch --no-tags origin "$subscription_sha"
test "$(git -C "$src" rev-parse FETCH_HEAD)" = "$subscription_sha"
git -C "$src" cherry-pick --no-commit "$subscription_sha"
(
  cd "$src"
  npm ci --no-audit --no-fund
  npm run build -w @uichat-mira/folio
  npm pack --workspace @uichat-mira/folio --pack-destination "$destination"
)
