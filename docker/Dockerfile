# Build and serve stage
FROM node:20.18.3-slim

# Set timezone and install required packages
ENV TZ=Asia/Seoul

RUN apt-get update && apt-get install -y \
    tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code and serve config
COPY . .

# Build the application
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Expose port
EXPOSE 5173

# Start serve with updated options
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]