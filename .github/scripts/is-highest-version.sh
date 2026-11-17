#!/usr/bin/env bash
# Prints "true" if v<version> is the highest vX.Y.Z tag on the remote (counting itself),
# "false" otherwise. Used to avoid marking an older version "Latest" when recovering a release.
# Fails (non-zero, prints nothing) if the remote cannot be queried: never fails open.
# Usage: is-highest-version.sh <version>
set -euo pipefail

version="${1:?usage: is-highest-version.sh <version>}"
remote="${REMOTE:-origin}"

# Separate assignment so 'set -e' aborts when ls-remote fails.
tags="$(git ls-remote --tags "$remote" 'refs/tags/v*')"

highest="$( { sed 's#.*refs/tags/##; s#\^{}$##' <<<"$tags"; echo "v${version}"; } \
  | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -uV | tail -n1)"

if [ "$highest" = "v${version}" ]; then echo true; else echo false; fi
