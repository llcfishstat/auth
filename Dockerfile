FROM node:20-bullseye-slim AS builder

ENV TZ=UTC

WORKDIR /app

COPY package.json yarn.lock ./

COPY prisma ./prisma

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 9001

CMD [ "yarn", "dev" ]