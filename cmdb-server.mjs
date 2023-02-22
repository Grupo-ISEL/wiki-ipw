// Application Entry Point.

import cmdbDataMem from "./data/cmdb-data-mem.mjs";
import cmdbDataElastic from "./data/cmdb-data-elastic.mjs"
import imdbData from "./data/imdb-movies-data.mjs"
import mockFetch from "./data/imdb-mock-data.mjs"
import servicesInit from "./services/cmdb-services.mjs"
import apiInit from "./web/api/cmdb-api.mjs"
import siteInit from "./web/site/cmdb-web-site.mjs"
import createApp from './cmdb.mjs'
import {MAX_LIMIT} from "./services/cmdb-services-constants.mjs"

if (!process.env['ELASTIC_URL'])
   process.env['ELASTIC_URL'] = 'http://localhost:9200'

if (!process.env['IMDB_API_KEY'])
// process.env.IMDB_API_KEY = 'k_1234abcd'
   process.env['IMDB_API_KEY']= 'k_0v6pmbzj'

const cmdbData = cmdbDataElastic(process.env['ELASTIC_URL'])
const moviesData = imdbData(fetch, process.env['IMDB_API_KEY'], MAX_LIMIT)
// const cmdbData = cmdbDataMem()
// mockFetch is optional

const services = servicesInit(cmdbData, moviesData)
// const services = servicesInit(cmdbData, moviesData, mockFetch)
const api = apiInit(services)
const site = siteInit(services)

let app = createApp(services, api, site)

const PORT = 1337

console.log("Start setting up server")

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")
