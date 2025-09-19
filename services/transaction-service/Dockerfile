FROM node:20-alpine AS builder
WORKDIR /app

# 1) Install deps via workspaces
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/transaction-service/package.json ./services/transaction-service/package.json
RUN npm i --workspaces

# 2) Copy full sources
COPY . .

# 3) Build shared types and the service
RUN npm --workspace packages/shared run build &&     npm --workspace services/transaction-service run build

# 4) Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# copy node_modules for runtime
COPY --from=builder /app/node_modules ./node_modules
# copy compiled dist of the service
COPY --from=builder /app/services/transaction-service/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
