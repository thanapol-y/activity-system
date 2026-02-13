FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG BACKEND_URL=http://backend.railway.internal:5000
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
