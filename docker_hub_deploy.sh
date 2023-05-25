#!/bin/bash

#docker buildx build --push --platform linux/arm64 -t zimbora/rtls-controller-arm64 .
#docker buildx build --push --platform linux/arm/v7 -t zimbora/rtls-controller-armv7 -f Dockerfile_armv7 .
docker buildx build --push --platform linux/arm/v7 -t zimbora/rtls-controller-armv7 -f Dockerfile .
