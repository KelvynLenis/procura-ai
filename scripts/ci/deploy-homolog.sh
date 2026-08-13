#!/bin/bash
set -euo pipefail

RELEASE_VERSION="${1:?informe RELEASE_VERSION}"
HEALTH_URL="${2:?informe HEALTH_URL}"
BRANCH="${3:-homolog.secties}"

DEPLOY_DIR="${DEPLOY_PATH:-/home/procuraai/procuraai-web}"
cd "$DEPLOY_DIR"

PREV_SHA="$(cat .deploy/previous-sha)"
PREV_TAG="$(cat .deploy/previous-tag 2>/dev/null || echo latest)"

export IMAGE_TAG="$RELEASE_VERSION"
chmod +x deploy.sh
./deploy.sh

rollback() {
  echo "Health check falhou — rollback para ${PREV_SHA} (${PREV_TAG})"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "$PREV_SHA"
  export IMAGE_TAG="$PREV_TAG"
  ./deploy.sh
  exit 1
}

if ! curl -sf --max-time 60 "$HEALTH_URL" >/dev/null; then
  rollback
fi

printf '%s\n' "$RELEASE_VERSION" > .deploy/current-tag
git rev-parse HEAD > .deploy/current-sha
printf '%s %s %s\n' "$RELEASE_VERSION" "$(date -Iseconds)" "$(git rev-parse HEAD)" >> .deploy/releases.log
echo "Release ${RELEASE_VERSION} ok"
