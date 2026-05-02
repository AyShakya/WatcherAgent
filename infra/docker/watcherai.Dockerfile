FROM node:18-alpine

WORKDIR /app

COPY watcherai/package*.json ./
RUN npm install

COPY watcherai/ .

ENV NODE_ENV=production

CMD ["node", "server.js"]