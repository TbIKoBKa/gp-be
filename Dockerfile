FROM node:18 as build
WORKDIR /app
COPY package*.json .
COPY yarn.lock .
RUN yarn cache clean
RUN yarn
COPY . .
RUN yarn build

FROM node:18
WORKDIR /app
COPY package.json .
RUN yarn --only=production
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD yarn start:prod