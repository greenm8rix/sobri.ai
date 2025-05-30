# Stage 1: Build the React application
FROM node:18-alpine as build

# Arguments for environment variables during build
ARG VITE_APP_BACKEND_URL
ARG VITE_APP_OPENAI_API_KEY

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Create a .env file from build arguments
RUN echo "VITE_APP_BACKEND_URL=${VITE_APP_BACKEND_URL}" >> .env && \
    echo "VITE_APP_OPENAI_API_KEY=${VITE_APP_OPENAI_API_KEY}" >> .env

# Build the application
# This command should match your project's build script in package.json
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build stage to Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
# We will create nginx.conf next
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
