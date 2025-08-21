# Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Use npm, as pnpm is not available in the environment
COPY package*.json ./
RUN npm install --cache ./.npm --prefer-offline --no-audit

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

CMD ["node", "dist/index.js"]