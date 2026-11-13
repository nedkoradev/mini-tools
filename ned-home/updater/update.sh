#!/bin/sh
# NED Home updater. Default: dry-run. No secrets are downloaded or modified.
set -eu
ROOT=/volume1/Docker
APP="$ROOT/ned-home"
STATE="$ROOT/ned-home-updater"
REPO=https://raw.githubusercontent.com/nedkoradev/mini-tools
MODE="${1:---dry-run}"
case "$MODE" in --dry-run|--apply) ;; *) echo "Usage: sh update.sh --dry-run|--apply"; exit 2;; esac
mkdir -p "$STATE"
umask 077
LOCK="$STATE/.lock"
if ! mkdir "$LOCK" 2>/dev/null; then echo "Updater is already running"; exit 1; fi
TMP=""
cleanup(){ [ -z "$TMP" ] || rm -rf "$TMP"; rmdir "$LOCK" 2>/dev/null || true; }
trap cleanup EXIT HUP INT TERM
TMP=$(mktemp -d "$STATE/staging.XXXXXX")
curl -fsSL --retry 2 --connect-timeout 10 --max-time 30 "$REPO/main/ned-home/release.txt" -o "$TMP/release.txt" || { echo "No approved release marker; nothing to install."; exit 0; }
SHA=$(tr -d '\r\n' < "$TMP/release.txt")
case "$SHA" in *[!0123456789abcdef]*|'') echo "Invalid release SHA"; exit 1;; esac
[ "${#SHA}" -eq 40 ] || { echo "Release SHA must have 40 hex digits"; exit 1; }
CURRENT=""
[ ! -f "$STATE/installed.sha" ] || CURRENT=$(cat "$STATE/installed.sha")
[ "$CURRENT" != "$SHA" ] || { echo "Already installed: $SHA"; exit 0; }
for f in index.html app.js server.py; do
  curl -fsSL --retry 2 --connect-timeout 10 --max-time 30 "$REPO/$SHA/ned-home/$f" -o "$TMP/$f"
  [ -s "$TMP/$f" ] || { echo "Empty $f"; exit 1; }
done
python3 -m py_compile "$TMP/server.py"
# Optional JavaScript syntax check when node exists.
if command -v node >/dev/null 2>&1; then node --check "$TMP/app.js"; fi
grep -qi 'NED Home' "$TMP/index.html" || { echo "Missing dashboard title"; exit 1; }
echo "Approved SHA: $SHA"
echo "Files downloaded and checked."
if [ "$MODE" = --dry-run ]; then
  echo "DRY RUN: no NAS app files changed; Docker not restarted."
  exit 0
fi
[ "$(id -u)" -eq 0 ] || { echo "Apply requires sudo"; exit 1; }
[ -d "$APP" ] || { echo "App directory missing"; exit 1; }
# Snapshot only the three managed source files; leave compose and secrets untouched.
BACKUP="$STATE/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
for f in index.html app.js server.py; do cp -p "$APP/$f" "$BACKUP/$f"; done
restore(){
  echo "Restoring previous source files from $BACKUP"
  for f in index.html app.js server.py; do cp -p "$BACKUP/$f" "$APP/$f"; done
  docker restart ned-home >/dev/null 2>&1 || true
}
for f in index.html app.js server.py; do
  cp "$TMP/$f" "$APP/$f.new"
done
for f in index.html app.js server.py; do mv -f "$APP/$f.new" "$APP/$f"; done
if ! docker restart ned-home >/dev/null; then restore; exit 1; fi
sleep 4
if ! docker inspect -f '{{.State.Running}}' ned-home | grep -qx true; then restore; exit 1; fi
# Check HTTP server, not HA integration. HA credentials remain in existing container.
if ! curl -fsS --max-time 10 http://127.0.0.1:8765/ | grep -qi 'NED Home'; then restore; exit 1; fi
printf '%s\n' "$SHA" > "$STATE/installed.sha"
echo "Installed $SHA successfully. Backup: $BACKUP"
