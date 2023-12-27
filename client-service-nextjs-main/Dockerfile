FROM node:18.16.1-alpine3.18 as deps
WORKDIR /app
COPY package.json .yarnrc yarn.lock ./
RUN yarn install \
    --prefer-offline \
    --frozen-lockfile \
    --non-interactive \
    --production=false

FROM node:18.16.1-alpine3.18 as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN apk update && \
    apk add --no-cache git pcre2-dev 
RUN mkdir /etc/ld.so.conf.d && \
    ldconfig /etc/ld.so.conf.d
RUN yarn build

FROM node:18.16.1-alpine3.18 as runner
WORKDIR /app
COPY --from=builder /usr/bin/git /usr/bin/git
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY next*js ./
COPY sshd_config /etc/ssh/
COPY entrypoint.sh ./
COPY .gitlab/persistenvjs.sh ./
COPY .gitlab/persistlog.sh ./
COPY .gitlab/copy-state.sh ./
COPY scripts/build.js ./

# Persist files/directory requirements
RUN apk add --no-cache inotify-tools rsync

# Start and enable SSH for Azure App Service
RUN apk add --no-cache openssh \
    && echo "root:Docker!" | chpasswd \
    && chmod +x ./entrypoint.sh \
    && cd /etc/ssh/ \
    && ssh-keygen -A

EXPOSE 3000 2222

ENTRYPOINT [ "./entrypoint.sh" ]
