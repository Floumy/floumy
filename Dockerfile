# Stage 1: Build the application
FROM node:v20.11.1 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock if using yarn)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the NestJS application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Setup the production environment
FROM node:20.11.1

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock if using yarn)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "dist/main"]
