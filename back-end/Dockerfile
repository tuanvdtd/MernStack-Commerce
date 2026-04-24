# Build ---
FROM node:20-alpine as build-step
WORKDIR /app

# Copy package.json và package-lock.json
COPY package.json package-lock.json ./

# Cài đặt dependencies từ lockfile (tương đương --frozen-lockfile)
RUN npm ci

COPY . .
RUN npm run build

#  Production
FROM node:20-alpine as production-step
WORKDIR /app

COPY --from=build-step /app/build ./build
COPY --from=build-step /app/package.json /app/package-lock.json ./

# Chỉ cài dependencies production từ lockfile
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000
CMD ["node", "build/src/server.js"]