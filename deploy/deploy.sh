#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
release=${1:?Usage: deploy/deploy.sh IMAGE_TAG [--registry-images]}
[[ $# -le 2 && ${2:-} =~ ^(--registry-images)?$ ]] || { echo "Invalid arguments" >&2; exit 1; }
export DOCKER_CONFIG=${DOCKER_CONFIG:-$PWD/.docker}
[[ $release =~ ^[a-zA-Z0-9_.-]+$ ]] || { echo 'Invalid release tag' >&2; exit 1; }
export IMAGE_TAG=$release
exec 9>.deploy.lock
flock -n 9 || { echo 'Another deployment is running' >&2; exit 1; }
compose=(docker compose -p phonesale -f docker-compose.prod.yml)
"${compose[@]}" config --quiet
if [[ ${2:-} == --registry-images ]]; then
    [[ ${IMAGE_PREFIX:-} =~ ^ghcr.io/[a-z0-9_.-]+/[a-z0-9_.-]+$ ]] || { echo 'Invalid registry image prefix' >&2; exit 1; }
    export IMAGE_PREFIX
    "${compose[@]}" pull api web
else
    "${compose[@]}" build
fi
if [[ -n $("${compose[@]}" ps --status running -q postgres) ]]; then
    bash deploy/backup.sh
fi
"${compose[@]}" up -d --no-build --wait --wait-timeout 300
profile=$("${compose[@]}" exec -T api node -p 'process.env.SEED_PROFILE || "starter"')
case "$profile" in
    demo) "${compose[@]}" exec -T -e NODE_ENV=development api node dist/database/seed-demo.js ;;
    starter) ;;
    *) echo 'SEED_PROFILE must be starter or demo' >&2; exit 1 ;;
esac
"${compose[@]}" exec -T api npm run seed:starter:prod
"${compose[@]}" exec -T api node deploy-smoke.cjs
printf '%s\n' "$release" > .deployed-tag
if grep -q '^IMAGE_TAG=' .env; then
    sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$release/" .env
else
    printf '\nIMAGE_TAG=%s\n' "$release" >> .env
fi
if [[ ${2:-} == --registry-images ]]; then
    if grep -q '^IMAGE_PREFIX=' .env; then
        sed -i "s|^IMAGE_PREFIX=.*|IMAGE_PREFIX=$IMAGE_PREFIX|" .env
    else
        printf '\nIMAGE_PREFIX=%s\n' "$IMAGE_PREFIX" >> .env
    fi
fi
"${compose[@]}" ps
