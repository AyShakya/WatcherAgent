# ---------- BUILD ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 1) copy only deps first (better cache)
COPY watcher/package*.json ./

RUN npm install

# 2) override prisma (your constraint)
RUN npm install prisma@7 @prisma/client@7 @prisma/adapter-pg pg dotenv

# 3) copy source
COPY watcher/ .

# 4) prisma + build
RUN npx prisma generate
RUN npm run build


# ---------- RUNTIME ----------
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# copy everything from builder (includes node_modules + .next)
COPY --from=builder /app ./

# ❌ DO NOT run npm install again (removes override + breaks)
# RUN npm install --omit=dev  ← remove this
RUN apk add --no-cache docker-cli

EXPOSE 3000

CMD ["npm", "start"]