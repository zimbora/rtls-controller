#!/bin/bash

docker buildx build --push --platform linux/arm64 -t zimbora/rtls-controller-arm64 .
