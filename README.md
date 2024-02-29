INSTALLATION:
-------------

1. `cp .env-default .env` - copies a templated config file (a list of default values)


DEV RUNNING:
------------

1. `docker-compose up` - runs the app in the Docker


PROD BUILDING AND RUNNING:
--------------------------

1. Setup a pipeline which will do the `npm run build` command before building a docker image.
2. Build the the `Dockerfile` which must be used for the prod env.


TESTING & LINTING:
------------------

1. To run unit tests: `docker run -v ./:/app -it --rm bitcoin-price-api npm run test`
2. To run unit tests coverage: `docker run -v ./:/app -it --rm bitcoin-price-api npm run coverage`
3. To run linter: `docker run -v ./:/app -it --rm bitcoin-price-api npm run lint`

PS: Alternatively you can run those commands inside a running container