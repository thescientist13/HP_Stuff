tmpdir  := `mktemp`
export PATH := "./node_modules/.bin:" + env_var('PATH')
set dotenv-load

export PNPM := `which pnpm`
export NPM := `which npm`
export NPX := `which npx`

install:
  ${PNPM} install

dev: install
  ${PNPM} run astro dev

check: install
  ${PNPM} astro check;
  ${PNPM} tsc -p tsconfig.node.json --noEmit;

build: install parse
  ${PNPM} astro build

parse: install pre-build
  ./bin/grampsParser.sh

pre-build: install
  ${PNPM} tsc -p tsconfig.node.json

deploy:
  cd infrastructure
  pulumi up
  cd ..
