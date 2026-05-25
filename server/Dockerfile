# Stage 1: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

# Install all deps (including dev for TypeScript compilation)
COPY package*.json ./
RUN npm ci --frozen-lockfile

COPY . .
RUN npm run build

# Stage 2: Lean production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only compiled output and production manifest
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Ensure persistent uploads directory exists
RUN mkdir -p /app/uploads

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 5001

# Persist uploads across container restarts (mounted by compose)
VOLUME /app/uploads

CMD ["node", "dist/index.js"]
