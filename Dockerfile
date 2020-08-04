FROM node:12

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i typescript -g && npm i webpack@4.32.2 -g && npm ci
COPY . ./
RUN npm run build
CMD [ "node", "./_dist/server/start.js" ]
EXPOSE 9000