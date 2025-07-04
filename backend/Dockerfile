# Dockerfile for NestJS Backend

# --- Base Stage ---
# Use a Node.js base image with pnpm
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# --- Dependencies Stage ---
# Install dependencies using pnpm
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# --- Build Stage ---
# Build the NestJS application
FROM base AS build
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# --- Production Stage ---
# Create a smaller production image
FROM base AS production
COPY --from=build /usr/src/app/dist ./dist
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
