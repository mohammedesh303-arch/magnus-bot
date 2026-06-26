FROM node:18-alpine

RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --omit=dev 2>&1 || npm install --legacy-peer-deps 2>&1

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
