#!/usr/bin/env bash

export PNPM=`which pnpm`
export PNPX=`which pnpx`
export TEMPDIR=`mktemp -d`
export JUST="${PNPX} just"
export CWD=`pwd`

echo "{\"CWD\":\"./\"}" > $CWD/src/lib/root.json

$PNPX ts-node -P tsconfig.node.json $CWD/src/bin/gramps2Json.ts

#$PNPX ts-node -P tsconfig.node.json -vv
#$PNPX ts-node -P tsconfig.node.json --showConfig

rm -rf ${TEMPDIR}