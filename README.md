# Chelas Movie Database

## Usage
You need a [IMDB API key](https://imdb-api.com) to use this API.
The API key must be set in the environment variable `IMDB_API_KEY`.

## Debug
To get debug information, set the environment variable `DEBUG` to the namespace `cmdb:*`.

## Example usage with `nodemon`
```bash
IMDB_API_KEY=your-api-key DEBUG=cmdb:* nodemon index.js
```
