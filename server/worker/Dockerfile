FROM node:20-alpine
WORKDIR /app
COPY server/watcherai/package*.json ./watcherai/
COPY server/worker/package*.json ./server/worker/
RUN cd watcherai && npm install
RUN cd server/worker && npm install --legacy-peer-deps
COPY server/watcherai/ ./watcherai/
COPY server/worker/ ./server/worker/
RUN cd server/worker && npm run build
WORKDIR /app/server/worker
CMD ["npm", "start"]
