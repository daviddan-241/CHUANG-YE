# ============================================================
# DAVE Social AI — Production Docker Image
# Timezone: Asia/Shanghai | Playwright baked in build
# ============================================================

# Stage 1: Install all Node dependencies
FROM node:20-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Stage 2: Build Next.js
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js in standalone mode
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# ── System timezone → Shanghai ──────────────────────────────
ENV TZ=Asia/Shanghai
ENV LANG=zh_CN.UTF-8
ENV LANGUAGE=zh_CN:zh
ENV LC_ALL=zh_CN.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    # Timezone
    tzdata \
    # Playwright / Chromium system deps
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libatspi2.0-0 \
    libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
    libxrandr2 libgbm1 libxcb1 libpango-1.0-0 libcairo2 \
    libasound2 libxshmfence1 libgles2 libgl1 \
    # Fonts (Chinese + Emoji)
    fonts-noto-cjk fonts-noto-color-emoji fonts-liberation \
    # TLS / curl for health checks
    ca-certificates wget \
    # SQLite runtime (Prisma)
    libsqlite3-dev \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# ── Install Playwright Chromium (baked into image) ──────────
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx --yes playwright@1.61.1 install chromium \
    && npx playwright install-deps chromium \
    && rm -rf /var/cache/apt/lists/*

# ── Next.js standalone output ───────────────────────────────
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Runtime directories
RUN mkdir -p public/images/generated public/sessions public/media/hyper-realistic \
    && chown -R nextjs:nodejs /app /ms-playwright

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run DB migrations then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node server.js"]
