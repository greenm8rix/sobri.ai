# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install dependencies
# Using npm ci for cleaner, more reliable builds from package-lock.json
RUN npm install --production

# Bundle app source
COPY . .

# Make sure the .env file is NOT copied into the image for security.
# Environment variables will be injected by Cloud Run.

# Expose port 4000 (or the one your app uses, configurable via PORT env var)
EXPOSE 4000

# Define the command to run your app
CMD [ "node", "server.js" ]
