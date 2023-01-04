FROM node:12-alpine

WORKDIR /usr/src/app

COPY package.json ./

COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3000

RUN yarn start

# FROM node:16 as build
# WORKDIR /app
# COPY package*.json .
# COPY yarn.lock .
# RUN yarn
# COPY . .
# RUN yarn build

# FROM node:16
# WORKDIR /app
# COPY package.json .
# RUN yarn --only=production
# COPY --from=build /app/dist ./dist
# EXPOSE 3000
# CMD yarn start:prod