#!/bin/ash
set -e

# Define a default API URL if the environment variable is not set
API_URL_TO_USE=${REACT_APP_API_URL:-http://localhost:8080}

# Replace the placeholder with the actual or default URL
sed -i "s|__REACT_APP_API_URL__|${API_URL_TO_USE}|g" /usr/share/nginx/html/index.html

# Execute the original command
exec "$@"