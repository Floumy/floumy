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

## Development Setup

### Git Hooks

This repository uses Git hooks to automate certain tasks. To enable the hooks, run:

```bash
git config core.hooksPath .githooks
```

#### Pre-commit Hook

A pre-commit hook is set up to automatically fix lint issues before committing changes. See [.githooks/README.md](./.githooks/README.md) for more details.

## Config

The stack will include a MinIO instance. You can access it at `http://localhost:9000`. The credentials can be found in the `docker-compose.yml` file.
After first start of the stack you need to create a bucket named `floumy`.
