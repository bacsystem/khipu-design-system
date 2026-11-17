#!/usr/bin/env bash
# Decides whether the current commit needs a release.
#  - version = package.json "version" (must be X.Y.Z)
#  - tag_exists = whether v<version> exists on the remote
#  - release_exists = whether a GitHub release for it exists (needs GH_TOKEN and
#    GITHUB_REPOSITORY, both set in Actions)
#  - needs_release = true when the tag OR the release is missing. A tag without release is the
#    recovery path (tag created, release creation failed): the release job then skips the tag.
#  - when needs_release is true, changelog.d/ must hold no pending fragments and the CHANGELOG
#    section must exist and be dated (fails early, before running the checks)
# Writes the values to $GITHUB_OUTPUT (or stdout when unset).
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
remote="${REMOTE:-origin}"
out="${GITHUB_OUTPUT:-/dev/stdout}"

version="$(node -p "require('./package.json').version")"
if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "::error::package.json version '$version' is not X.Y.Z" >&2
  exit 1
fi

if [ -n "$(git ls-remote --tags "$remote" "refs/tags/v${version}" | head -n1)" ]; then
  tag_exists=true
else
  tag_exists=false
fi

release_exists=false
if [ "$tag_exists" = true ]; then
  if resp="$(gh api "repos/${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}/releases/tags/v${version}" 2>&1)"; then
    release_exists=true
  elif grep -q "HTTP 404" <<<"$resp"; then
    release_exists=false
  else
    echo "::error::could not query the release for v${version}: $resp" >&2
    exit 1
  fi
fi

if [ "$tag_exists" = true ] && [ "$release_exists" = true ]; then
  echo "Tag and release v${version} already exist: nothing to do." >&2
  needs=false
else
  [ "$tag_exists" = true ] && echo "Tag v${version} exists without a release: will only create the release." >&2
  # Fragments left in changelog.d/ at a release commit would be missing from the notes: assemble them first
  # (README, "Publicar una versión": node scripts/changelog.mjs release).
  pending="$(find changelog.d -maxdepth 1 -name '*.md' ! -iname README.md 2>/dev/null | sort)"
  if [ -n "$pending" ]; then
    echo "::error::changelog.d/ still has fragments ($(echo "$pending" | tr '\n' ' ')): run 'node scripts/changelog.mjs release' in the release PR." >&2
    exit 1
  fi
  "$here/changelog-section.sh" "$version" >/dev/null
  needs=true
fi

{
  echo "version=$version"
  echo "tag_exists=$tag_exists"
  echo "release_exists=$release_exists"
  echo "needs_release=$needs"
} >> "$out"
