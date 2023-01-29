// Module that contains the functions that handle all HTTP Website requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format


import getHTTPError from "../http-errors.mjs"
import debugInit from 'debug'
import express from 'express'
import {MAX_LIMIT, MIN_OFFSET} from "../../services/cmdb-services-constants.mjs"


const debug = debugInit("cmdb:site:movies")

function View(name, data) {
    this.name = name
    this.data = data
}

export default function (servicesGroups, servicesMovies) {
    // Validate argument

    if (!servicesGroups)
        throw new Error("servicesGroups is mandatory")
    if (!servicesMovies)
        throw new Error("servicesMovies is mandatory")

    const router = express.Router()

    router.get('/', handleRequest(getMovies))
    router.get('/search', getSearchMovieForm)
    router.get('/top', handleRequest(getTopMovies))
    router.get('/:id', handleRequest(getMovie))

    return router

    function getSearchMovieForm(req, rsp) {
        rsp.render('searchMovie')
    }

    async function getMovie(req, rsp) {

        const movie = req.session.movies && req.params.id in req.session.movies ? req.session.movies[req.params.id] : await servicesMovies.getMovie(req.params.id)
        const groups = req.session.groups

        debug(`getMovie getMovie: %O`, movie)
        debug(`getMovie getGroups: %O`, groups)
        return new View('movie', {groups, movie})
    }

    async function getMovies(req, rsp) {
        const movies = await servicesMovies.getMovies(req.movieRequest)
        if (!movies)
            return
        debug(`getMovies: %O`, movies)
        return new View('searchResults', movies)
    }

    async function getTopMovies(req, rsp) {
        const movies = await servicesMovies.getTopMovies(req.movieRequest)
        if (!movies)
            return
        // debug(`getTopMovies: %O`, movies)
        return new View('topMovies', {
            title: 'Top Movies', groups: req.session.groups, movies: movies.map(m => {
                return ({
                    id: m.id,
                    title: m.title,
                    rank: m.rank,
                    year: m.year,
                    imdbRating: m.imdbRating,
                    image: m.imageUrl,
                })
            }),
        })
    }

    function handleRequest(handler) {
        return async function (req, rsp) {
            try {
                req.movieRequest = {
                    offset: req.query.offset || MIN_OFFSET,
                    limit: req.query.limit || MAX_LIMIT,
                    search: req.query.search,
                }
                const view = await handler(req, rsp)
                if (view)
                    rsp.render(view.name, view.data)
            } catch (e) {
                const httpError = getHTTPError(e.code, e.message || e)
                debug(`Error: %O`, httpError)
                rsp.status(httpError.status)
                rsp.render('error', httpError)
                debug(`Error: %O`, e)
            }
        }
    }
}
