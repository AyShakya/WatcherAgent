# ---- Build ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY watcher/package*.json ./

# Install original deps
RUN npm install

# Override Prisma to v7 ONLY inside container
RUN npm install prisma@7 @prisma/client@7 @prisma/adapter-pg pg dotenv

COPY watcher/ .

# Generate Prisma client with v7
RUN npx prisma generate

RUN npm run build

# ---- Runtime ----
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]