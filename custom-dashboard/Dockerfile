# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (include dev deps so build tools like vite are available)
COPY package.json package-lock.json* ./
RUN npm install --silent

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
RUN apk add --no-cache bash

# Remove default nginx content and copy build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# Provide a small health-check page that proxies API health via client-side fetch
# (The built app will handle API calls; keep existing fallback)
EXPOSE 80
CMD ["nginx","-g","daemon off;"]