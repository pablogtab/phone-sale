#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077
mkdir -p backups
exec 8>.backup.lock
flock -n 8 || { echo 'Another backup is running' >&2; exit 1; }
compose=(docker compose -p phonesale -f docker-compose.prod.yml)
stamp=$(date -u +%Y%m%dT%H%M%SZ)
database="backups/database-${stamp}.dump"
uploads="backups/uploads-${stamp}.tar.gz"
"${compose[@]}" exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$database.tmp"
mv "$database.tmp" "$database"
"${compose[@]}" exec -T api tar -czf - -C /app uploads > "$uploads.tmp"
mv "$uploads.tmp" "$uploads"
echo "Backup complete: $stamp"
