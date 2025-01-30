# Build and serve stage
FROM node:20-alpine

# Set timezone
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "dist", "-l", "3000"]