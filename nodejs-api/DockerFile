# Build ---
FROM node:20-alpine as build-step
WORKDIR /app

# Copy cả package.json và yarn.lock
COPY package.json yarn.lock ./

# Cài đặt thư viện bằng Yarn (tương đương với npm ci)
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

#  Production
FROM node:20-alpine as production-step
WORKDIR /app

COPY --from=build-step /app/build ./build
COPY --from=build-step /app/package.json /app/yarn.lock ./

# Chỉ cài dependencies thực tế bằng Yarn
RUN yarn install --production --frozen-lockfile && yarn cache clean

EXPOSE 3000
CMD ["node", "build/src/server.js"]