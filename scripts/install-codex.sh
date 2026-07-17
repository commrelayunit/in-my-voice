#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${IN_MY_VOICE_REPO_URL:-https://github.com/commrelayunit/in-my-voice.git}"
PLUGIN_DIR="${IN_MY_VOICE_PLUGIN_DIR:-$HOME/plugins/in-my-voice}"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
SKILLS_DIR="$CODEX_HOME_DIR/skills"
SKILL_NAME="in-my-voice"
SKILL_SOURCE="$PLUGIN_DIR/skills/$SKILL_NAME"
SKILL_LINK="$SKILLS_DIR/$SKILL_NAME"
FORCE=0
UPDATE=1

usage() {
  cat <<'EOF'
Install In My Voice for headless Codex CLI.

Usage:
  install-codex.sh [--force] [--no-update]

Environment:
  IN_MY_VOICE_REPO_URL      Git URL to clone. Defaults to the public GitHub repo.
  IN_MY_VOICE_PLUGIN_DIR    Clone/install directory. Defaults to ~/plugins/in-my-voice.
  CODEX_HOME                Codex home. Defaults to ~/.codex.

Options:
  --force      Replace an existing in-my-voice skill symlink if it points elsewhere.
  --no-update  Do not run git pull in an existing clone.
  -h, --help   Show this help.
EOF
}

while (($#)); do
  case "$1" in
    --force)
      FORCE=1
      ;;
    --no-update)
      UPDATE=0
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

need git
need ln
need mkdir

if [[ -d "$PLUGIN_DIR/.git" ]]; then
  if [[ "$UPDATE" -eq 1 ]]; then
    git -C "$PLUGIN_DIR" pull --ff-only
  fi
elif [[ -e "$PLUGIN_DIR" ]]; then
  if [[ ! -f "$SKILL_SOURCE/SKILL.md" ]]; then
    echo "Existing path is not an In My Voice checkout: $PLUGIN_DIR" >&2
    echo "Set IN_MY_VOICE_PLUGIN_DIR to another path, or move the existing path aside." >&2
    exit 1
  fi
else
  mkdir -p "$(dirname "$PLUGIN_DIR")"
  git clone "$REPO_URL" "$PLUGIN_DIR"
fi

if [[ ! -f "$SKILL_SOURCE/SKILL.md" ]]; then
  echo "Could not find skill entry: $SKILL_SOURCE/SKILL.md" >&2
  exit 1
fi

mkdir -p "$SKILLS_DIR"

if [[ -L "$SKILL_LINK" ]]; then
  CURRENT_TARGET="$(readlink "$SKILL_LINK")"
  if [[ "$CURRENT_TARGET" != "$SKILL_SOURCE" ]]; then
    if [[ "$FORCE" -eq 1 ]]; then
      unlink "$SKILL_LINK"
    else
      echo "Skill symlink already exists and points elsewhere:" >&2
      echo "  $SKILL_LINK -> $CURRENT_TARGET" >&2
      echo "Run with --force to replace it." >&2
      exit 1
    fi
  fi
elif [[ -e "$SKILL_LINK" ]]; then
  echo "Skill path already exists and is not a symlink: $SKILL_LINK" >&2
  echo "Move it aside, then rerun this installer." >&2
  exit 1
fi

if [[ ! -e "$SKILL_LINK" ]]; then
  ln -s "$SKILL_SOURCE" "$SKILL_LINK"
fi

cat <<EOF
Installed In My Voice for Codex.

Repo:   $PLUGIN_DIR
Skill:  $SKILL_LINK -> $SKILL_SOURCE

Verify with:
  codex debug prompt-input '\$in-my-voice Capture a voice profile' | rg 'in-my-voice'
EOF
