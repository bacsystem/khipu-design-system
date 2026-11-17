#!/usr/bin/env bash
# Builds the annotated-tag message in the format of the existing tags:
#   "v<version>: <PR title> (#<n>)"   (v0.7.0: tablas en móvil (...) (#60))
# For a merge commit ("Merge pull request #N from ..."), the title is the first line of the
# body; for a squash commit ("title (#N)") the subject is used as is.
# Usage: tag-message.sh <version> [rev]
set -euo pipefail

version="${1:?usage: tag-message.sh <version> [rev]}"
rev="${2:-HEAD}"
subject="$(git log -1 --format=%s "$rev")"

if [[ "$subject" =~ ^Merge\ pull\ request\ \#([0-9]+)\  ]]; then
  pr="${BASH_REMATCH[1]}"
  title="$(git log -1 --format=%b "$rev" | sed -n '/./{p;q;}')"
  [ -n "$title" ] || title="$subject"
  printf 'v%s: %s (#%s)' "$version" "$title" "$pr"
else
  printf 'v%s: %s' "$version" "$subject"
fi
