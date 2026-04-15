# Build ---
FROM node:20-alpine AS build-step
WORKDIR /app

# Copy file cấu hình thư viện trước để tận dụng cache của Docker
COPY package.json package-lock.json ./
RUN npm ci

# Copy toàn bộ code nguồn vào
COPY . .

# Thực hiện lệnh build: tsc -b && vite build (tạo ra thư mục dist)
RUN npm run build

# Production ---
FROM nginx:alpine

# Copy file cấu hình Nginx tùy chỉnh (để tránh lỗi 404 khi F5 trang)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy các file tĩnh đã build từ stage 1 sang thư mục mặc định của Nginx
COPY --from=build-step /app/dist /usr/share/nginx/html

EXPOSE 80

# Chạy Nginx ở chế độ foreground để Docker quản lý được process
CMD ["nginx", "-g", "daemon off;"]