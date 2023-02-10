# eckero-admin-api

Eckerö Line Admin API

This project consists of a RESTful API that can be used to clear the Redis cache from Google Cloud Console.

Runs on Google Cloud's fully managed compute platform [Google Cloud Run](https://cloud.google.com/run).

## Documentation

The RESTful API is documented using the OAS 3.0 specification and can be found in this repository under `./swagger.json`.

[Swagger UI](https://swagger.io/tools/swagger-ui/) can be used to visualize the specification in a web environment.

## Architecture

![architecture diagram](docs/eckero-admin-api.svg)

## Development

The project can be developed on any environment supporting [Docker](https://www.docker.com/), [NodeJS](https://nodejs.org/) and the [Google Cloud SDK](https://cloud.google.com/sdk/gcloud).

### Prerequisites

- NodeJs v18 (latest Maintenance LTS)
- Yarn `npm -g install yarn`
- [Google Cloud SDK](https://cloud.google.com/sdk/gcloud)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Install

- `yarn` to install project dependencies
- `cp .env.test .env` and replace environment variables

### Run

- `docker-compose -f docker-compose.yml up -d` to start needed backend services (db, cache)
- `yarn dev` to start the development server
- api available at [http://localhost:8080](http://localhost:8080)

## Environments & Infrastructure

All environments run on Google Cloud and are provisioned and configured using [Terraform](https://www.terraform.io/).
Additional information about the infrastructure can be found in the [README](terraform/README.md).

The following envionments have been created and configured on Google Cloud:

- [staging](https://eckero-mobile-api-staging-ds55qghzsq-lz.a.run.app/) - A testing environment for new features during development and before deployment to production. This environment can be in a broken state at any time and you should not rely on it being constantly available.
- [production](https://eckero-mobile-api-production-bbcuzcufra-lz.a.run.app/) - Production environment for the mobile app. 99.99% availability running only stable code. This environment is monitored for performance issues and error scenarios which are automatically reported to the development team to take action on.

## Deployment

Deployment of the API to [Google Cloud Run](https://cloud.google.com/run) is fully automated using [Google Cloud Build](https://cloud.google.com/cloud-build). The Cloud Build configuration file can be found in this repository under `./cloudbuild.yaml`.

Github branches `develop` and `master` are configured to be automatically built and deployed on every push to the repository:

- `develop` is deployed to the `staging` environment
- `master` is deployed to the `production` environment

The Cloud Build triggers are configured using [Terraform](https://www.terraform.io/) under `./terrafom/` in in this repository
