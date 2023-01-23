// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from 'express'
import cors from 'cors'
import path from 'path'
import hbs from 'hbs'
import url from 'url'
import swaggerUi from 'swagger-ui-express'
import yamljs from 'yamljs'
import cmdbDataMem from "./data/cmdb-data-mem.mjs";
import cmdbDataElastic from "./data/cmdb-data-elastic.mjs"
import moviesData from "./data/imdb-movies-data.mjs"
import mockFetch from "./data/imdb-mock-data.mjs"
import servicesInit from "./services/cmdb-services.mjs"
import apiInit from "./web/api/cmdb-api.mjs"
import siteInit from "./web/site/cmdb-web-site.mjs"
import morgan from 'morgan'
import passport from 'passport'
import expressSession from 'express-session'


const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const swaggerDocument = yamljs.load('./docs/cmdb-api-spec.yaml')
const PORT = 1337

process.env.IMDB_API_KEY = 'k_1234abcd'
process.env['ELASTIC_URL'] = 'http://localhost:9200'
if (!process.env['ELASTIC_URL'])
   throw new Error("ELASTIC_URL environment variables are mandatory")

const cmdbData = cmdbDataElastic(process.env['ELASTIC_URL'])
// const cmdbData = cmdbDataMem()
// mockFetch is optional
// const services = servicesInit(cmdbData, moviesData, mockFetch)
const services = servicesInit(cmdbData, moviesData, mockFetch)

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
app.use(morgan('dev'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Web site routes
app.use('/static', express.static(`${__dirname}./web/site/static-files`, {redirect: false, index: 'index.html'}))
app.get('/groups/new', site.getNewGroupForm)
app.get('/groups/:id/edit', site.getEditGroupForm)
app.get('/groups/:id', site.getGroup)
app.get('/groups', site.getGroups)
app.post('/groups', site.createGroup)
app.post('/groups/edit', site.updateGroup)
app.get('/movies/search', site.getSearchMovieForm)
app.get('/movies/top', site.getTopMovies)
app.get('/movies/:id', site.getMovie)
app.get('/movies', site.getMovies)
app.get('/login', site.getLoginForm)
// app.get('/site/signup', site.getSignUpForm)

// Web API routes
app.get('/api/movies', api.movies.getMovies)
app.get('/api/movies/top', api.movies.getTopMovies)
app.get('/api/movies/:id', api.movies.getMovie)

// Groups
app.get('/api/groups', api.groups.getGroups)
app.post('/api/groups', api.groups.createGroup)
app.get('/api/groups/:id', api.groups.getGroup)
app.put('/api/groups/:id', api.groups.updateGroup)
app.delete('/api/groups/:id', api.groups.deleteGroup)
app.put('/api/groups/:id/movies/:movieId', api.groups.addMovieToGroup)
app.delete('/api/groups/:id/movies/:movieId', api.groups.removeMovieFromGroup)

// Users
app.post('/api/users', api.users.createUser)

let server = app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")

export default server
