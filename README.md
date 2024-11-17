# Floumy App Stack

## Description
This repository contains the stack of the Floumy app. It is composed of a backend and a frontend.

## Stack
The stack is composed of the following services:
- [Floumy Api](./api)
- [Floumy Web](./web)

## Start the stack
To start the stack, you need to run the following commands:

```bash
./dev/start.sh
```

## Useful scripts

* `./dev/start.sh`: Start the stack
* `./dev/stop.sh`: Stop the stack
* `./dev/enter-api.sh`: Enter the api container
* `./dev/enter-web.sh`: Enter the web container

## Config

The stack will include a MinIO instance. You can access it at `http://localhost:9000`. The credentials can be found in the `docker-compose.yml` file.
After first start of the stack you need to create a bucket named `floumy`.