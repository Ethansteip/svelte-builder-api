# Use Node.js LTS (Long Term Support) version
FROM node:20-slim

# Install Git and SSH client
RUN apt-get update && apt-get install -y git openssh-client && rm -rf /var/lib/apt/lists/*

# Set up SSH directory
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

# Add private SSH key from environment variable
ARG SSH_PRIVATE_KEY
RUN echo "$SSH_PRIVATE_KEY" > /root/.ssh/id_rsa && chmod 600 /root/.ssh/id_rsa

# Add GitHub to known_hosts to avoid host verification errors
RUN ssh-keyscan -t rsa github.com >> /root/.ssh/known_hosts

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the project (if you have a build step)
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]