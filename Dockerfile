# Multi-stage build for the icons.ewooral.com docs site.
# Stage 1: build the static Next.js export from site/.
# Stage 2: serve out/ via nginx-alpine on port 3004.
#
# Build context is the repo root (NOT site/) because the prebuild copy
# script needs to read ../src/styles/icons.css.

FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack.
RUN corepack enable

# Install site deps first (cache-friendly: only re-runs when the lockfile
# changes, not when SVGs change). We pass --config.minimumReleaseAge=0
# inline because pnpm 11's default 24h supply-chain policy rejects any
# dep published in the last day — fine for prod apps, but the docs site
# is rebuilt continuously and shouldn't block on lockfile freshness.
COPY site/package.json site/pnpm-lock.yaml ./site/
WORKDIR /app/site
RUN pnpm install --frozen-lockfile --config.minimumReleaseAge=0

# Now copy the source needed for the build — the site itself plus the
# package's SVGs and CSS (which the docs site dogfoods).
WORKDIR /app
COPY site ./site
COPY src/styles ./src/styles
COPY src/svg ./src/svg
COPY src/vanilla ./src/vanilla

WORKDIR /app/site
RUN pnpm build


FROM nginx:1.27-alpine AS runtime

# Replace the default vhost with one that serves the static export on 3004.
COPY site/nginx.conf /etc/nginx/conf.d/default.conf

# Drop in the built static output.
COPY --from=builder /app/site/out /usr/share/nginx/html

EXPOSE 3004

# nginx in foreground (required for docker).
CMD ["nginx", "-g", "daemon off;"]
