// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import yamljs from 'yamljs'
import apiGroups from './api/cmdb-api-groups.mjs'
import apiUsers from "./api/cmdb-api-users.mjs";
import apiMovies from "./api/cmdb-api-movies.mjs";

const swaggerDocument = yamljs.load('./docs/cmdb-api-spec.yaml')
const PORT = 1337

console.log("Start setting up server")
let app = express()

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.get('/movies', apiMovies.getMovies)
app.get('/movies/top', apiMovies.getTopMovies)

app.get('/groups', apiGroups.getGroups)
app.post('/groups', apiGroups.createGroup)
app.get('/groups/:id', apiGroups.getGroup)
app.put('/groups/:id', apiGroups.updateGroup)
app.delete('/groups/:id', apiGroups.deleteGroup)
app.put('/groups/:id/movies/:movieId', apiGroups.addMovieToGroup)
app.delete('/groups/:id/movies/:movieId', apiGroups.removeMovieFromGroup)

app.get('/users', apiUsers.getUsers)
app.post('/users', apiUsers.createUser)

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")


