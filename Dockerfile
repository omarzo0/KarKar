# Simple Dockerfile for the centralized Node.js app
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port
ENV PORT 5000
EXPOSE 5000

# Start app
CMD ["node", "app.js"]
