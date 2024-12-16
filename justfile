tmpdir  := `mktemp`
export PATH := "./node_modules/.bin:" + env_var('PATH')
set dotenv-load

export PNPM := `which pnpm`
export NPM := `which npm`
export NPX := `which npx`

install:
  ${PNPM} install

dev: install
  ${PNPM} run dev

check: install
  ${NPX} tsc --noEmit -p .;

build: install parse
  ${PNPM} run build

parse: install pre-build
  ./bin/grampsParser.sh

pre-build: install
  ${NPX} tsc -p tsconfig.bin.json

deploy:
  cd infrastructure
  pulumi up
  cd ..
