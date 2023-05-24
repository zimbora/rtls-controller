# syntax=docker/dockerfile:1
FROM nikolaik/python-nodejs:python3.9-nodejs18

WORKDIR /usr/src/app

COPY package.json ./

#RUN apt-get update && apt-get install -y bash
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

CMD ["node", "index.js"]
