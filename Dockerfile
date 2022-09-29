FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src
COPY entry.sh ./

RUN npm install -g npm
RUN npm install
RUN npm run build

FROM builder AS final

WORKDIR /usr/src/app

RUN npm install --only=production --omit=dev

COPY --from=builder /usr/src/app/dist .

RUN npm install pm2 ton-cli -g --omit=dev

EXPOSE 8080

CMD ["ton-cli"]
