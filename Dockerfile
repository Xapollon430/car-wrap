# syntax=docker/dockerfile:1

FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV PORT=8080

COPY server/package*.json ./server/
RUN npm --prefix server ci --include=dev

COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist
ENV NODE_ENV=production

EXPOSE 8080
CMD ["npm", "--prefix", "server", "run", "start"]
