# Uplist Project

## Project Prerequisites

> Note: Skip Installation Steps if specified tools are installed

- Docker

### Installing Docker

- [Installing Docker Desktop in MAC](https://docs.docker.com/docker-for-mac/install/)
- After Installation, Open Docker Desktop App and register for an account (Free)
- Sign in on Docker Desktop

## Folder Structure

 This will be the folder structure for development purposes

|         Structure         |   
|---------------------------|   
| - dev-env                 |
| --- api                   |
| --- client-service-nextjs |

### Cloning the repository

1. run `git clone git@gitlab.lanexus.com:uplist/dev-env.git`
2. \*clone both client and api services inside dev-env repo - follow the steps below:
3. run `git clone git@gitlab.lanexus.com:uplist/api-service.git`
4. run `git clone git@gitlab.lanexus.com:uplist/client-service-nextjs.git`

### Setting up API service

1. \* Return back to dev-env
2. cd api-service
3. run `git checkout develop`
4. run `cp .env.example .env`

### Setting up client service

1. \* Return back to dev-env
2. cd api-service
3. run `git checkout develop`
4. run `cp .env.example .env`

### Run docker-compose

1. \*Return to dev-env folder
2. run `docker-compose up -d`

### Additional setup for api-service

 After all containers are running, migrate database to MySQL from Laravel migrations.

1. \* Access the api-service's docker container - follow the steps below:
2. get docker container name of api-service - `docker ps`
3. run `docker exec -it {api service docker container} bash`
4. run `cd /app`
5. run `php artisan migrate:fresh --seed`

Initially, this project use the following ports:

| Server         | Port   |
| -------------- | ------ |
| MySQL          | `3306` |
| api-service    | `8081` |
| client-service | `3000` |

You can edit your ports in `docker-compose.yml` and rebuild the container.
