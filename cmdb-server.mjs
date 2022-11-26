// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import yamljs from 'yamljs'
import cmdbData from "./data/cmdb-data-mem.mjs";
import moviesData from "./data/imdb-movies-data.mjs"
import mockFetch from "./data/imdb-mock-data.mjs"
import servicesInit from "./services/cmdb-services.mjs"
import apiInit from "./api/cmdb-api.mjs"

const swaggerDocument = yamljs.load('./docs/cmdb-api-spec.yaml')
const PORT = 1337

// mockFetch is optional
const services = servicesInit(cmdbData, moviesData, mockFetch)
const api = apiInit(services.groups, services.movies, services.users)

console.log("Start setting up server")
let app = express()

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.get('/movies', api.movies.getMovies)
app.get('/movies/top', api.movies.getTopMovies)

app.get('/groups', api.groups.getGroups)
app.post('/groups', api.groups.createGroup)
app.get('/groups/:id', api.groups.getGroup)
app.put('/groups/:id', api.groups.updateGroup)
app.delete('/groups/:id', api.groups.deleteGroup)
app.put('/groups/:id/movies/:movieId', api.groups.addMovieToGroup)
app.delete('/groups/:id/movies/:movieId', api.groups.removeMovieFromGroup)

app.post('/users', api.users.createUser)

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")


