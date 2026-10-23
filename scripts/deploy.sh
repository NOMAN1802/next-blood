#!/usr/bin/env bash
# Deploy Next Blood BD to the Hostinger VPS.
#
# Usage:
#   npm run deploy                build locally and upload
#   npm run deploy -- --rollback  restore the previous deployment
#
# The site is static files served by nginx from $REMOTE_DIR/dist, so no
# server restart is needed and the other apps on the VPS are not touched.

set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@187.77.145.233}"
REMOTE_DIR="/var/www/nextbloodbd"
SITE_URL="https://nextbloodbd.com"

cd "$(dirname "$0")/.."

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31mError:\033[0m %s\n' "$*" >&2; exit 1; }

check_live() {
  info "Checking $SITE_URL"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL/")
  [ "$code" = "200" ] || fail "$SITE_URL returned HTTP $code"
  info "Live: $SITE_URL (HTTP 200)"
}

if [ "${1:-}" = "--rollback" ]; then
  info "Rolling back to the previous deployment"
  ssh "$SERVER" "set -e
    cd $REMOTE_DIR
    [ -d dist.prev ] || { echo 'No previous deployment to roll back to'; exit 1; }
    mv dist dist.failed && mv dist.prev dist && rm -rf dist.failed"
  check_live
  exit 0
fi

ssh -o BatchMode=yes -o ConnectTimeout=10 "$SERVER" true \
  || fail "Cannot SSH to $SERVER (is your SSH key set up?)"

if [ -n "$(git status --porcelain)" ]; then
  info "Warning: you have uncommitted changes; deploying them anyway"
fi

info "Building"
npm run build
[ -f dist/index.html ] || fail "Build did not produce dist/index.html"

info "Saving current deployment as dist.prev"
ssh "$SERVER" "cd $REMOTE_DIR && rm -rf dist.prev && cp -a dist dist.prev"

info "Uploading to $SERVER:$REMOTE_DIR/dist"
rsync -az --delete dist/ "$SERVER:$REMOTE_DIR/dist/"
ssh "$SERVER" "chown -R www-data:www-data $REMOTE_DIR/dist"

check_live
info "Deployed $(git rev-parse --short HEAD) — roll back with: npm run deploy -- --rollback"
