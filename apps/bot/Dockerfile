FROM node:22-bookworm-slim AS deps
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.base.json .npmrc ./
COPY packages ./packages
COPY apps/bot ./apps/bot
RUN pnpm install --frozen-lockfile || pnpm install

FROM deps AS build
WORKDIR /app
RUN pnpm --filter @wc3dd/shared build \
 && pnpm --filter @wc3dd/db exec prisma generate \
 && pnpm --filter @wc3dd/db build \
 && pnpm --filter @wc3dd/bot build

FROM node:22-bookworm-slim AS runner
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/app/data
COPY --from=build /app /app
CMD ["pnpm", "--filter", "@wc3dd/bot", "start"]
