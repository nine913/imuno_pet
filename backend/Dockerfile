FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

CMD ["node", "index.js"]
