FROM node:18-alpine as base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base as development
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base as build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine as production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
