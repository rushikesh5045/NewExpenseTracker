# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files only first (better caching)
COPY package.json package-lock.json* ./

# Use 'npm ci' for a clean, deterministic install
RUN npm ci --only=production

# Stage 2: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 1. Copy source code FIRST
COPY . .

# 2. Copy dependencies FROM the deps stage
# Putting this second prevents local files from overwriting linux modules
COPY --from=deps /app/node_modules ./node_modules

# Cloud Run defaults to port 8080
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]