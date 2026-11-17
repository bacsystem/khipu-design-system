#!/usr/bin/env bash
# Decides whether the current commit needs a release.
#  - version = package.json "version" (must be X.Y.Z)
#  - tag_exists = whether v<version> already exists on the remote
#  - if the tag is missing, the CHANGELOG section must exist and be dated (fails early,
#    before running the checks)
# Writes version / tag_exists / needs_release to $GITHUB_OUTPUT (or stdout when unset).
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
remote="${REMOTE:-origin}"
out="${GITHUB_OUTPUT:-/dev/stdout}"

version="$(node -p "require('./package.json').version")"
if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "::error::package.json version '$version' is not X.Y.Z" >&2
  exit 1
fi

# --exit-code makes ls-remote exit 2 when nothing matches; we only care about the output.
if [ -n "$(git ls-remote --tags "$remote" "refs/tags/v${version}" | head -n1)" ]; then
  tag_exists=true
else
  tag_exists=false
fi

if [ "$tag_exists" = false ]; then
  "$here/changelog-section.sh" "$version" >/dev/null
  needs=true
else
  echo "Tag v${version} already exists: nothing to release." >&2
  needs=false
fi

{
  echo "version=$version"
  echo "tag_exists=$tag_exists"
  echo "needs_release=$needs"
} >> "$out"
