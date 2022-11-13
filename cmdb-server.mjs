// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import yamljs from 'yamljs'
import * as api from './api/cmdb-web-api.mjs'

const swaggerDocument = yamljs.load('./docs/cmdb-api-spec.yaml')
const PORT = 1337

console.log("Start setting up server")
let app = express()

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.get('/movies', api.getMovies)
app.get('/movies/top', api.getTopMovies)

app.get('/groups', api.getGroups)
app.post('/groups', api.createGroup)
app.get('/groups/:id', api.getGroup)
app.put('/groups/:id', api.updateGroup)
app.delete('/groups/:id', api.deleteGroup)
app.put('/groups/:id/movies/:movieId', api.addMovieToGroup)
app.delete('/groups/:id/movies/:movieId', api.removeMovieFromGroup)

app.get('/users', api.getUsers)
app.post('/users', api.createUser)

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")


