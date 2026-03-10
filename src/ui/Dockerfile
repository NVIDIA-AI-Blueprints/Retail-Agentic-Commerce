# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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

# Copy source code (includes kui-foundations-react-external with pre-built dist)
COPY src/ui ./

# Set build-time environment variables
# Note: API keys are handled server-side via proxy routes (never exposed to browser)
ARG NEXT_PUBLIC_UCP_PLATFORM_PROFILE_URL=http://merchant:8000/.well-known/ucp
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_MCP_SERVER_URL=/apps-sdk
ENV NEXT_PUBLIC_UCP_PLATFORM_PROFILE_URL=${NEXT_PUBLIC_UCP_PLATFORM_PROFILE_URL}

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
