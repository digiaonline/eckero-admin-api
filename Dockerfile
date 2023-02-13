# Stage 0
FROM node:18 AS builder

WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY . ./
ENV NODE_ENV=production
RUN yarn build
RUN yarn cache clean && yarn

# Stage 1
FROM node:18-slim

ARG build_number
ARG app_env

RUN useradd -ms /app app -U
ENV \
  NODE_ENV=production \
  APP_ENV=$app_env \
  BUILD_NUMBER=$build_number

WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY .env.$app_env .env
COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
RUN chown app:app /usr/src/app -R

USER app
EXPOSE 8080

CMD [ "yarn", "start" ]
