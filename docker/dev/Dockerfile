FROM node:21-alpine

RUN npm i -g pnpm

WORKDIR /app

COPY . .

CMD pnpm install && pnpm run start:dev