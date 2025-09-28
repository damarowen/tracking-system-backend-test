FROM node:22-alpine AS base

# Ensure we're using the correct Node version
RUN node --version && npm --version

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Add explicit crypto polyfill if needed
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# Start the application
CMD ["node", "dist/infrastructure/main.js"]
