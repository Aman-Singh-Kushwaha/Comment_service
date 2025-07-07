# Dockerfile for Next.js Frontend

# --- Base Stage ---
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /usr/src/app

# --- Dependencies Stage ---
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
RUN pnpm install tailwindcss @tailwindcss/postcss autoprefixer

# --- Build Stage ---
FROM base AS build
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# --- Production Stage ---
FROM base AS production
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./

EXPOSE 3001

CMD ["pnpm", "start"]