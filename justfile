tmpdir  := `mktemp`
export PATH := "./node_modules/.bin:" + env_var('PATH')
set dotenv-load

#export PNPM := `which pnpm`
export NPM := `which npm`
export NPX := `which npx`

install:
    ${NPM} install

dev: install
    ${npm} run astro dev

check: install
    ${NPX}  astro check;
    ${NPX} tsc -p tsconfig.node.json --noEmit;

build: install parse
    ${NPX} astro build

parse: install pre-build
    ./bin/grampsParser.sh

pre-build: install
    ${NPX} tsc -p tsconfig.node.json
