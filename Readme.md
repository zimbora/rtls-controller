# rtls-controller

### run
>> node index.js

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

## Before launch program
  Edit config/env/index
    Choose:
      - Development or Production

  Check config/env/(production/development) configurations for
    - DB options
    - Ports
    - debug level
    - etc.
