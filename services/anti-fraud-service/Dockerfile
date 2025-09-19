FROM node:20-alpine AS builder
WORKDIR /app

# 1) Install deps via workspaces
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/anti-fraud-service/package.json ./services/anti-fraud-service/package.json
RUN npm i --workspaces

# 2) Copy full sources
COPY . .

# 3) Build shared types and the service
RUN npm --workspace packages/shared run build &&     npm --workspace services/anti-fraud-service run build

# 4) Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/anti-fraud-service/dist ./dist
CMD ["node", "dist/index.js"]
