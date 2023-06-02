# syntax=docker/dockerfile:1
FROM node:18-slim

WORKDIR /usr/src/app

RUN apt-get update && \
apt-get install -y python3 && \
apt-get install -y network-manager && \
apt-get install make && \
apt install -y build-essential && \
apt-get clean

ENV PYTHON=/usr/bin/python3

RUN npm install -g npm

COPY package.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

CMD ["node", "index.js"]
