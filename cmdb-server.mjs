// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from 'express'
import cors from 'cors'
import path from 'path'
import hbs from 'hbs'
import url from 'url'
import swaggerUi from 'swagger-ui-express'
import yamljs from 'yamljs'
import cmdbData from "./data/cmdb-data-mem.mjs";
import cmdbDataElastic from "./data/cmdb-data-elastic.mjs"
import moviesData from "./data/imdb-movies-data.mjs"
import mockFetch from "./data/imdb-mock-data.mjs"
import servicesInit from "./services/cmdb-services.mjs"
import apiInit from "./web/api/cmdb-api.mjs"
import siteInit from "./web/site/cmdb-web-site.mjs"

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const swaggerDocument = yamljs.load('./docs/cmdb-api-spec.yaml')
const PORT = 1337

// mockFetch is optional
// const services = servicesInit(cmdbData, moviesData, mockFetch)
const services = servicesInit(cmdbDataElastic, moviesData, mockFetch)

// const services = servicesInit(cmdbData, moviesData)
const api = apiInit(services.groups, services.movies, services.users)
const site = siteInit(services.groups, services.movies, services.users)

console.log("Start setting up server")
let app = express()

// View engine setup
const viewsPath = path.join(__dirname, 'web', 'site', 'views')
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(path.join(viewsPath, 'partials'))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Web site routes
app.use('/site/static', express.static(`${__dirname}./web/site/static-files`, {redirect: false, index: 'index.html'}))
app.get('/site/groups/new', site.getNewGroupForm)
app.get('/site/groups/:id', site.getGroup)
app.get('/site/groups', site.getGroups)
app.post('/site/groups', site.createGroup)
//app.post('/site/groups/:id', site.updateGroup)
app.get('/site/movies/search', site.getSearchMovieForm)
app.get('/site/movies/top', site.getTopMovies)
app.get('/site/movies/:id', site.getMovie)

// Web API routes
app.get('/movies', api.movies.getMovies)
app.get('/movies/top', api.movies.getTopMovies)
app.get('/movies/:id', api.movies.getMovie)

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


