FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update
RUN apt-get install -y curl wget gpg

COPY . /app
WORKDIR /app

FROM base AS prod-deps

WORKDIR /app
VOLUME [ "/pnpm-store", "/app/node_modules" ]
RUN pnpm config --global set store-dir /pnpm-store

COPY package.json /app/package.json
WORKDIR /app
RUN pnpm install -P

FROM prod-deps AS build
RUN pnpm install

ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=13312
RUN pnpm astro build --verbose

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 4321
WORKDIR /app
CMD [ "pnpm", "start" ]

ENV PORT=80
ENV HOST=0.0.0.0
