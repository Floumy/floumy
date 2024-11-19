#!/usr/bin/env bash

# Get current user ID
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    USER_ID="node"
else
    # Linux
    USER_ID=$(id -u)
fi

# Enter container
docker compose exec -u "$USER_ID" web bash