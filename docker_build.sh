#!/bin/bash
VERSION=0.1.0
docker build --force-rm -t rtls-controller:$VERSION -f Dockerfile .
