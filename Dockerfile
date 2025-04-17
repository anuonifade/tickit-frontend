# Build stage
FROM node:18.19-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application for production
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine as production

# Add bash for the entrypoint script
RUN apk add --no-cache bash

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Expose port 8080
EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# Development stage
FROM node:18.19-alpine as development

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm install

# Explicitly install date-fns to ensure it's available
RUN npm install date-fns@4.1.0 --save

# Copy the rest of the application
COPY . .

# Expose port 3000 for the development server
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
