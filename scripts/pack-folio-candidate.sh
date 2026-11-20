#!/usr/bin/env bash
# Assemble pinned Folio UI/list package only. This consumer owns JSON subscriptions.
set -euo pipefail
src="${1:?Expected checked-out Folio source path}"
destination="${2:?Expected package output directory}"
dev_sha='7d06408aa25bde1b00409366cf302883af67592f'
test "$(git -C "$src" rev-parse HEAD)" = "$dev_sha"
(
  cd "$src"
  npm ci --no-audit --no-fund
  npm run build -w @uichat-mira/folio
  npm pack --workspace @uichat-mira/folio --pack-destination "$destination"
)
