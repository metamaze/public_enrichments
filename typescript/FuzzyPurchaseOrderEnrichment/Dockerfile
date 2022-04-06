FROM node:12.18.0 AS BUILD

LABEL maintainer="i.vancanegem@metamaze.eu"

WORKDIR /app

# Add package.json and install *before* adding application files
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "--max-http-header-size", "15000", "dist/index.js"]
