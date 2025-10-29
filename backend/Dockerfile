# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directory for SQLite database
RUN mkdir -p /usr/src/app/data

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check (matches app.js /health and Railway PORT)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get(`http://localhost:${process.env.PORT || 3000}/health`, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with migrations and seeds
CMD sh -lc "npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && node app.js"
