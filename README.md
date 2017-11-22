# EOS API Services

## Getting Started

```bash
$ git clone https://github.com/Tandemly/eos-api-service.git
$ cd eos-api-service
$ cp .env.example .env
```

## Configuration (.env)
The API services are configured through a local `.env` file.  The standard setup is as follows:

```
NODE_ENV=development
PORT=8888
JWT_SECRET=bA2xcjpf8y5aSUFsNB2qN5yymUBSs6es3qHoFpGkec75RCeBb8cpKauGefw5qy4
JWT_EXPIRATION_MINUTES=60
MONGO_URI=mongodb://eosdemo:eosdemo1234@ds111336.mlab.com:11336/eos-demo
MONGO_URI_TESTS=mongodb://apiuser:apiuser123!@ds127105.mlab.com:27105/api-service-test
EOSD_CONNECTOR_URI=https://demo-eos-deployment-mrvbxqxaro.now.sh
EOSD_CONNECTOR_TEST_URI=http://localhost:8888
```

You can set the `NODE_ENV` to which ever environment you're running in (`production` or `development`) and the port. Because the
API Service uses JWT (JSON Web Tokens) for authentication/authorization, you'll need to set a `JWT_SECRET` and a `JWT_EXPIRATION_MINUTES`.
Ensure any secret you use is sufficiently long and random (you can use md5, sha256, et al) to generate one.  

The `MONGO_URI` should point to the same mongodb host that the particular eosd ndoe you are connecting to is writing out to.  That
eosd node and the api service share this datbase.  The `_TESTS_URI` environments are only used in `test` environment builds on Travis.

## Running
Once configured, you can get the API Service up and running using the following:

```bash
$ yarn
$ yarn docs
$ yarn start
```

Running `yarn start` will run the service using pm2 and with `NODE_ENV=production`. The command `yarn docs` generates the API documentation
which is available from the running API service at `/v1/docs`.  You can get a simple status of the API service by performing a `GET` on the 
`/v1/status` endpoint which should return a 200 Ok.



# Express ES2017 REST API Boilerplate

Boilerplate/Generator/Starter Project for building RESTful APIs and microservices using Node.js, Express and MongoDB

## Features

 - No transpilers, just vanilla javascript
 - ES2017 latest features like Async/Await
 - CORS enabled
 - Uses [yarn](https://yarnpkg.com)
 - Express + MongoDB ([Mongoose](http://mongoosejs.com/))
 - Consistent coding styles with [editorconfig](http://editorconfig.org)
 - [Docker](https://www.docker.com/) support
 - Uses [helmet](https://github.com/helmetjs/helmet) to set some HTTP headers for security
 - Load environment variables from .env files with [dotenv](https://github.com/rolodato/dotenv-safe)
 - Request validation with [joi](https://github.com/hapijs/joi)
 - Gzip compression with [compression](https://github.com/expressjs/compression)
 - Linting with [eslint](http://eslint.org)
 - Tests with [mocha](https://mochajs.org), [chai](http://chaijs.com) and [sinon](http://sinonjs.org)
 - Code coverage with [istanbul](https://istanbul.js.org) and [coveralls](https://coveralls.io)
 - Git hooks with [husky](https://github.com/typicode/husky) 
 - Logging with [morgan](https://github.com/expressjs/morgan)
 - Authentication and Authorization with [passport](http://passportjs.org)
 - API documentation geratorion with [apidoc](http://apidocjs.com)
 - Continuous integration support with [travisCI](https://travis-ci.org)
 - Monitoring with [pm2](https://github.com/Unitech/pm2)

## Requirements

 - [Node v7.6+](https://nodejs.org/en/download/current/) or [Docker](https://www.docker.com/)
 - [Yarn](https://yarnpkg.com/en/docs/install)

## Getting Started

Clone the repo and make it yours:

```bash
git clone --depth 1 https://github.com/danielfsousa/express-rest-es2017-boilerplate
cd express-rest-es2017-boilerplate
rm -rf .git
```

Install dependencies:

```bash
yarn
```

Set environment variables:

```bash
cp .env.example .env
```

## Running Locally

```bash
yarn dev
```

## Running in Production

```bash
yarn start
```

## Lint

```bash
# lint code with ESLint
yarn lint

# try to fix ESLint errors
yarn lint:fix

# lint and watch for changes
yarn lint:watch
```

## Test

```bash
# run all tests with Mocha
yarn test

# run unit tests
yarn test:unit

# run integration tests
yarn test:integration

# run all tests and watch for changes
yarn test:watch

# open nyc test coverage reports
yarn coverage
```

## Validate

```bash
# run lint and tests
yarn validate
```

## Logs

```bash
# show logs in production
pm2 logs
```

## Documentation

```bash
# generate and open api documentation
yarn docs
```

## Docker

```bash
# run container locally
yarn docker:dev
or
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# run container in production
yarn docker:prod
or
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# run tests
yarn docker:test
or
docker-compose -f docker-compose.yml -f docker-compose.test.yml up
```

## Inspirations

 - [KunalKapadia/express-mongoose-es6-rest-api](https://github.com/KunalKapadia/express-mongoose-es6-rest-api)
 - [diegohaz/rest](https://github.com/diegohaz/rest)

## License

[MIT License](README.md) - [Tandemly](https://github.com/Tandemly)
