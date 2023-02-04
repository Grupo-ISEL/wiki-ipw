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


const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const swaggerDocument = yamljs.load('./docs/cmdb-api-spec.yaml')
const PORT = 1337

// process.env.IMDB_API_KEY = 'k_1234abcd'
process.env.IMDB_API_KEY = 'k_0v6pmbzj'
process.env['ELASTIC_URL'] = 'http://localhost:9200'
if (!process.env['ELASTIC_URL'])
   throw new Error("ELASTIC_URL environment variables are mandatory")

const cmdbData = cmdbDataElastic(process.env['ELASTIC_URL'])
// const cmdbData = cmdbDataMem()
// mockFetch is optional

const services = servicesInit(cmdbData, moviesData)
// const services = servicesInit(cmdbData, moviesData, mockFetch)
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

app.use(express.static(`${__dirname}./web/site/resources`, {redirect: false, index: 'index.html'}))

// Web Site routes
app.get('/', site.getHome)
app.use(site.users)
app.use('/movies/', site.movies)
app.use('/groups/', site.groups)

// Web API routes
app.use('/api/movies/', api.movies)
app.use('/api/groups/', api.groups)
app.use('/api/users/', api.users)

// catch 404
app.use(site.getNotFound)

let server = app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")

export default server
