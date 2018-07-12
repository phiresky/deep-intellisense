#!/usr/bin/zsh

set -euo pipefail

inf=$(realpath $1)
cd repos
cat $inf | awk '{ print $1 }' | xargs -d '\n' -P4 -n1 git clone