#!/usr/bin/env bash

export PNPM=`which pnpm`
export PNPX=`which pnpx`
export TEMPDIR=`mktemp -d`
export JUST="${PNPX} just"
export CWD=`pwd`

echo "{\"CWD\":\"./\"}" > $CWD/src/lib/root.json

#this will set up a collection with
#json files for both the full db
#and optimized files for individual pages
$PNPX node  $CWD/src/bin/gramps2Json.js

rm -rf ${TEMPDIR}
