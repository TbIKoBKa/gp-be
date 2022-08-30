# UI

## Installation

All modules should be installed as part of monorepo flow from root folder

## Configuration

Copy and edit 

```bash
cp -rf .env.sample .env.development
nano .env.development
```

## Start

Start in watch mode
```bash
npm run start
```

Start in production mode
```bash
npm run build
npm run start:prod
```

## Test and Code Quality

```bash
npm run lint
npm run test
```

## Swagger

Swagger ui is available on

```
http://localhost:3001/swagger
```
