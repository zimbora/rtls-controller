# rtls-controller

## TODO

generate uid using:

    const crypto = require('crypto');
    console.log(crypto.randomUUID());
    
## setup

  1. run
    >> node index.js

  2. for docker image see docker tab

## docker

### build
>> ./docker_build.sh

### launch or restart container
>> ./docker_run.sh

### see logs
>> docker logs -f rtls-controller

### list containers
>> docker ps


## State Machine

### Setup

1. check if settings.txt exists, if not create it

2. read settings.txt file and load config

3. Init wifi interface

4. Websocket connect and authenticate

5. Get list of actuators and sensors for each sector for the respective map

### Loop

- read sensors and actuators state

- report sensors and actuators state

- check connections
