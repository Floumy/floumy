#!/usr/bin/env bash

cd $(dirname "$0")/..

(cd web && npm run start) & (cd api && npm run start:debug)