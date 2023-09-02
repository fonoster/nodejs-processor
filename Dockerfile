##
## Build
##
FROM node:lts-alpine as builder
LABEL Fonoster Team <fonosterteam@fonoster.com>

COPY . /build
WORKDIR /build

RUN apk add --no-cache git python3 make g++ && \
  npm install && \
  npm run build && \
  npm pack

##
## Runner
##
FROM node:lts-alpine as runner

COPY --from=builder /build/nodejs-processor-*.tgz .

RUN apk add --no-cache git python3 make g++ && \
  npm install -g nodejs-processor-*.tgz && \
  rm -f nodejs-processor-*.tgz && \
  rm -rf /var/cache/apk/* \
  rm -rf /tmp/* \
  apk del git python3 make g++

CMD [ "runner" ]