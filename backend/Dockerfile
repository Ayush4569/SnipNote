FROM node:23.5.0-alpine

WORKDIR /app

COPY package* .
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["node", "dist/index.js"]