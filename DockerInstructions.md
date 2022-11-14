
# How to run your docker program

x. Install docker
 (link)[https://docs.docker.com/engine/install/]
 apt install docker.io

x. get image
  docker pull zimbora/rtls-controller-xx

  xx can be:
    - armv7
    - amd64

  for other architectures contact support

x. create dir
  >> mkdir /opt/app
  >> mkdir /opt/app/rtls-controller

x. move into it
  >> cd /opt/app/rtls-controller

x. create file docker_run.sh
  >> touch docker_run.sh

x. make it runnable
  >> chmod u+x docker_run.sh

x. add the following commands
  >> nano docker_run.sh

#!/bin/bash
docker stop rtls-controller
docker rm rtls-controller
#  --net host \
docker run --privileged=true \
  -v /var/run/dbus:/var/run/dbus  \
  -v /opt/app/rtls-controller:/rtls-controller \
  --restart unless-stopped \
  --name rtls-controller \
  --env DATA_PATH=/rtls-controller/settings.txt \
  -p 20080:20080 \
  -td zimbora/rtls-controller-armv7
docker logs -f rtls-controller

  x. run container
    >> ./docker_run.sh

# watchtower
## install
docker pull containrrr/watchtower
## run

  x. create file updater.sh
    >> touch updater.sh

  x. make it runnable
    >> chmod u+x updater.sh

  x. add the following commands
    >> nano docker_run.sh

  #!/bin/bash
  docker stop watchtower
  docker rm watchtower
  docker run -d \
      --name watchtower \
      -v /var/run/docker.sock:/var/run/docker.sock \
      --restart unless-stopped \
      containrrr/watchtower \
      --cleanup \
      rtls-controller \
      rtls-scanner
  docker logs -f watchtower

  x. run container
    >> ./updater.sh
