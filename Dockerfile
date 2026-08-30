FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# next build (webpack compile + type-check + static generation) is the single
# largest memory consumer in this image. Same reasoning as the API: V8's
# default heap sizing scales with the HOST's total RAM, not with what's
# actually free once sibling containers on this VPS are accounted for.
# Capped here, build stage only, never shipped to the runtime image.
ENV NODE_OPTIONS=--max-old-space-size=1536
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p .next/cache && chown nextjs:nodejs .next/cache
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
