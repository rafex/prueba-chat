# Stage 1: Build the app with Node.js
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package and webpack config
COPY package.json yarn.lock webpack.config.js ./

# Install dependencies
RUN yarn install

# Copy source code and build
COPY src ./src
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Remove the default nginx content (optional)
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port and launch
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
