#!/bin/bash
docker stop rtls-controller
docker rm rtls-controller
docker run --restart unless-stopped --name rtls-controller -d rtls-controller:0.1.0
docker logs -f rtls-controller
