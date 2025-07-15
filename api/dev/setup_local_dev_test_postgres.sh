#!/bin/bash

# Configuration
DB_NAME=test
DB_USER=floumy
DB_PASSWORD=floumy
DB_CONTAINER_NAME=floumy-local-dev-test-db
DB_PORT=5455

# Pull the PostgreSQL image
echo "Pulling the PostgreSQL image..."
docker pull pgvector/pgvector:pg17

# Check if the container already exists
CONTAINER_EXISTS=$(docker ps -a --filter "name=^/${DB_CONTAINER_NAME}$" --format '{{.Names}}')

if [ "$CONTAINER_EXISTS" == "$DB_CONTAINER_NAME" ]; then
  # If container exists, ask user if they want to remove it
  read -p "Container $DB_CONTAINER_NAME already exists. Do you want to remove it and recreate? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop and remove the existing container
    echo "Stopping and removing the existing container..."
    docker stop $DB_CONTAINER_NAME
    docker rm $DB_CONTAINER_NAME
  else
    echo "Exiting script."
    exit 1
  fi
fi

# Create and start the PostgreSQL container
echo "Starting PostgreSQL container..."
docker run --name $DB_CONTAINER_NAME -e POSTGRES_DB=$DB_NAME -e POSTGRES_USER=$DB_USER -e POSTGRES_PASSWORD=$DB_PASSWORD -p $DB_PORT:5432 -d pgvector/pgvector:pg17

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "PostgreSQL container is ready!"
echo "Details for connecting to the database:"
echo "Host: localhost"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
