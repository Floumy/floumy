# Stage 1: Build the React application
FROM node:20.11.1 as build-stage

# Set the working directory in the Docker container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install the dependencies in the Docker container
RUN npm install --legacy-peer-deps

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Remove the .env file
RUN rm -f .env

# Build the application
RUN npm run build --production

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine as production-stage

# Copy the custom Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY --from=build-stage /app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Start Nginx and keep it running
CMD ["nginx", "-g", "daemon off;"]
