# Next.js UI Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Install dependencies
FROM node:20-slim AS deps

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy package files and local Kaizen UI dependency
COPY src/ui/package.json src/ui/pnpm-lock.yaml ./
COPY src/ui/kui-foundations-react-external ./kui-foundations-react-external

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/kui-foundations-react-external ./kui-foundations-react-external

# Copy source code
COPY src/ui ./

# Set build-time environment variables
# Note: API keys are handled server-side via proxy routes (never exposed to browser)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_MCP_SERVER_URL=/apps-sdk

# Build the application
RUN pnpm build

# Stage 3: Production runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
