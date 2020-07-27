FROM node:12

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci && npm i typescript -g && npm i webpack@4.32.2 -g
COPY . ./
RUN tsc
RUN webpack
CMD [ "node", "./_dist/server/start.js" ]
EXPOSE 9001