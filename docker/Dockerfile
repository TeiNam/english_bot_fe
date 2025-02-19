# Build and serve stage
FROM node:22.6.0-slim

# Set timezone and install required packages
ENV TZ=Asia/Seoul

RUN apt-get update && apt-get install -y \
    tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and serve config
COPY . .
COPY serve.json /app/dist/

# Build the application
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port 5173
EXPOSE 5173

# Start serve
CMD ["serve", "-s", "dist", "-l", "5173"]