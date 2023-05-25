# syntax=docker/dockerfile:1
FROM node:18-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y python3 && \
apt-get install make && \
apt install -y build-essential

ENV PYTHON=/usr/bin/python3

RUN npm install -g npm

#RUN apt-get update && apt-get install -y libgeos-dev

COPY package.json ./

#RUN apt-get update && apt-get install -y bash
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

CMD ["node", "index.js"]
