FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY seed-fake-data.mjs ./
CMD ["node", "seed-fake-data.mjs"]
