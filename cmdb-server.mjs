// Application Entry Point.

import cmdbDataMem from "./data/cmdb-data-mem.mjs";
import cmdbDataElastic from "./data/cmdb-data-elastic.mjs"
import moviesData from "./data/imdb-movies-data.mjs"
import mockFetch from "./data/imdb-mock-data.mjs"
import servicesInit from "./services/cmdb-services.mjs"
import apiInit from "./web/api/cmdb-api.mjs"
import siteInit from "./web/site/cmdb-web-site.mjs"
import createApp from './cmdb.mjs'

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

let app = createApp(services, api, site)

const PORT = 1337

console.log("Start setting up server")

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")
