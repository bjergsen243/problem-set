# Use Node.js version 20.x
FROM node:20-alpine as builder

ENV NODE_ENV build

USER node

WORKDIR /usr/src/app

COPY --chown=node:node package*.json yarn.lock ./

RUN yarn install --frozen-lockfile


FROM node:20-alpine

ENV NODE_ENV development

USER node

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/yarn.lock ./
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

CMD ["node", "dist/main"]