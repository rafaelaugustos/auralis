#!/usr/bin/env bash
set -euo pipefail

# Keep machine-specific toolchain fixes inside this process, never in shell files.
if [[ "$(uname)" == Darwin ]]; then
  if [[ -z "${ANDROID_HOME:-}" && -d "$HOME/Library/Android/sdk" ]]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  fi
  if [[ "${2:-}" == ios ]] && command -v brew >/dev/null 2>&1; then
    # Inspect installed opt links without asking Homebrew to refresh its API.
    auralis_prefix="$(cd "$(dirname "$(command -v brew)")/.." && pwd -P)"
    auralis_ruby="$auralis_prefix/opt/ruby"
    auralis_pods="$auralis_prefix/opt/cocoapods"
    if [[ -x "$auralis_ruby/bin/ruby" && -d "$auralis_pods/libexec" ]]; then
      # Homebrew CocoaPods must use the gems from its current Ruby, not an older
      # Ruby directory left in GEM_PATH after a Homebrew upgrade.
      auralis_gems="$("$auralis_ruby/bin/ruby" -rrubygems -e 'print Gem.default_dir')"
      auralis_ruby_api="$("$auralis_ruby/bin/ruby" -rrbconfig -e 'print RbConfig::CONFIG["ruby_version"]')"
      export GEM_PATH="$auralis_pods/libexec:$auralis_ruby/lib/ruby/gems/$auralis_ruby_api:$auralis_gems"
    fi
  fi
fi

exec ns "$@"
