# rtls-controller

## setup

  1. edit config/secret.js file according to the credentials given to you

  2. run
    >> node index.js

  3. for docker image see docker tab

## docker

### build
>> docker build -t  rtls-controller .

### launch container 1st time
>> docker run --name rtls-controller -d rtls-controller

### start container
>> docker start rtls-controller

### stop container
>> docker stop rtls-controller

### restart container
>> docker restart rtls-controller

### see logs
>> docker logs -f rtls-controller

### list containers
>> docker ps
