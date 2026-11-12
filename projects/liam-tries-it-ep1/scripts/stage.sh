#!/usr/bin/env bash
# Copy the project into remotion-composer/ so Remotion's bundler resolves node_modules (a symlink would not).
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
RC="$HERE/../../remotion-composer"
mkdir -p "$RC/projects/liam-tries-it-ep1"
rm -rf "$RC/projects/liam-tries-it-ep1/src" "$RC/projects/liam-tries-it-ep1/public" "$RC/projects/liam-tries-it-ep1/scripts"
cp -r "$HERE/src" "$HERE/public" "$HERE/scripts" "$RC/projects/liam-tries-it-ep1/"
