FROM node:21-alpine AS build

WORKDIR /build/app

COPY . .

RUN npm install --save -g pnpm

RUN pnpm install && \
    pnpm build && \
    pnpm prune

FROM node:21-alpine AS production

WORKDIR /app

COPY --from=build /build/app/dist ./dist
COPY --from=build /build/app/node_modules ./node_modules
COPY --from=build /build/app/package.json ./package.json
COPY --from=build /build/app/config ./config

RUN npm install --save -g pnpm && npm cache clean --force

CMD pnpm start:prod
