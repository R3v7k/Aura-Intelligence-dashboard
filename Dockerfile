# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install production dependencies and tsx for running server.ts
COPY package*.json ./
RUN npm ci --omit=dev && npm install tsx

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy backend files and config
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package.json ./

# Copy data files if they exist
COPY --from=builder /app/audit_logs.json ./
COPY --from=builder /app/chat_backups.json ./
COPY --from=builder /app/firebase-applet-config.json ./

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["npx", "tsx", "server.ts"]
