FROM ghcr.io/makedeb/makedeb:debian-bookworm AS apt-deps
ARG DEBIAN_FRONTEND=noninteractive
ARG APT_LISTCHANGES_FRONTEND=none
RUN sudo apt-get install -y git
RUN git clone "https://mpr.makedeb.org/just.git /just
WORKDIR /just
RUN makedeb -s

FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update
RUN apt-get install -y curl wget gpg

COPY . /app
WORKDIR /app

FROM base as prod-deps
COPY --from=apt-deps /just/*.deb .
RUN dpkg -i *.deb

WORKDIR /app
VOLUME [ "/pnpm-store", "/app/node_modules" ]
RUN pnpm config --global set store-dir /pnpm-store

COPY package.json /app/package.json
WORKDIR /app
RUN pnpm install
RUN pnpm i -D rust-just

FROM base AS build

RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 4321
CMD [ "pnpm", "start" ]

ENV PORT=80
ENV HOST=0.0.0.0
