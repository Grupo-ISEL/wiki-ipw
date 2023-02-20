// Register all HTTP API routes and creates the Express app.

import express from 'express'
import cors from 'cors'
import path from 'path'
import hbs from 'hbs'
import url from 'url'
import swaggerUi from 'swagger-ui-express'
import yamljs from 'yamljs'
import morgan from 'morgan'

function createApp(services, api, site) {
   const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
   const swaggerDocument = yamljs.load('./docs/cmdb-api-spec.yaml')
   let app = express()

   // View engine setup
   const viewsPath = path.join(__dirname, 'web', 'site', 'views')
   app.set('view engine', 'hbs')
   app.set('views', viewsPath)
   hbs.registerPartials(path.join(viewsPath, 'partials'))

   app.use(cors())
   app.use(express.json())
   app.use(express.urlencoded({extended: false}))
   app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }));
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

   // app.use(express.static(`${__dirname}./web/site/resources`, {redirect: false, index: 'index.html'}))
   app.use(express.static(`${__dirname}./web/site/resources`, {redirect: false}))

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

   return app
}

export default createApp
