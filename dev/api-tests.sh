#!/usr/bin/env bash

# Enter as current user
docker compose exec -u $(id -u) api npm run test