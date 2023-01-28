import debugInit from 'debug';
import getHTTPError from "../http-errors.mjs";
import {MAX_LIMIT} from "../../services/cmdb-services-constants.mjs"
import express from 'express'

export default function (moviesServices) {

    if (!moviesServices)
        throw new Error("moviesServices is mandatory")

    const debug = debugInit("cmdb:web:api:movies")

    const router = express.Router()

    router.get('/', handleMoviesRequest(getMovies))
    router.get('/top', handleMoviesRequest(getTopMovies))
    router.get('/:id', handleMoviesRequest(getMovie))

    return router

    async function getMovie(movieRequest) {
        debug(`getMovie with id: ${movieRequest.id}`)
        return await moviesServices.getMovie(movieRequest.id)
    }

    async function getMovies(movieRequest) {
        debug(`Searching movies with title ${movieRequest.search} and offset ${movieRequest.offset} and limit ${movieRequest.limit}`)
        return await moviesServices.getMovies(movieRequest)
    }

    // Get Top Movies
    async function getTopMovies(movieRequest) {
        debug(`Getting top 250 movies`)
        return await moviesServices.getTopMovies(movieRequest)
    }

    function handleMoviesRequest(handler) {
        return async function (req, rsp) {
            try {
                debug(`Handling movie request for ${req.originalUrl}`)
                // TODO: Should we use the request to store the movieRequest?
                req.movieRequest = {
                    id: req.params.id,
                    offset: req.query.offset || 0,
                    limit: req.query.limit || MAX_LIMIT,
                    search: req.query.search
                }
                const movies = await handler(req.movieRequest)
                rsp.json(movies)
            } catch (e) {
                debug(`Error handling request: %O`, e)
                const httpError = getHTTPError(e.code, e.message || e)
                rsp.status(httpError.status).json({error: httpError.message})
            }
        }
    }
}
