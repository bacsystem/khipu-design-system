#!/usr/bin/env bash
# Prints the body of the "## [X.Y.Z] - YYYY-MM-DD" section of CHANGELOG.md (no header,
# surrounding blank lines trimmed). Fails with a clear message if the section is missing,
# has no date in its header, or is empty.
# Usage: changelog-section.sh <version> [changelog-file]
set -euo pipefail

version="${1:?usage: changelog-section.sh <version> [changelog-file]}"
file="${2:-CHANGELOG.md}"
[ -f "$file" ] || { echo "::error::$file not found" >&2; exit 1; }

# Exact match on "## [<version>]" (version has dots, so compare as a fixed string).
header="$(awk -v v="$version" 'index($0, "## [" v "]") == 1 { print; exit }' "$file")"
if [ -z "$header" ]; then
  echo "::error::$file has no section '## [$version] - YYYY-MM-DD'. Add it before releasing." >&2
  exit 1
fi
if ! printf '%s\n' "$header" | grep -Eq '^## \[[^]]+\] - [0-9]{4}-[0-9]{2}-[0-9]{2}[[:space:]]*$'; then
  echo "::error::Section header '$header' has no date. Expected '## [$version] - YYYY-MM-DD'." >&2
  exit 1
fi

body="$(awk -v v="$version" '
  index($0, "## [" v "]") == 1 { on = 1; next }
  on && /^## \[/ { exit }
  on { print }
' "$file" | sed -e :a -e '/^[[:space:]]*$/{$d;N;ba' -e '}' | sed '/./,$!d')"

if [ -z "$body" ]; then
  echo "::error::Section '$header' in $file is empty." >&2
  exit 1
fi
printf '%s\n' "$body"
