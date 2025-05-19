#!/bin/sh
set -e

echo '{"level":"INFO","msg":"Start migration"}'
npm run db:migrate
echo '{"level":"INFO","msg":"Finish migration"}'

exec 'node' 'dist/server'
