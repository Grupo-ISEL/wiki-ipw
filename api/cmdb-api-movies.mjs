// List all movies
import cmdbServices from "../services/cmdb-services-movies.mjs";
import debugInit from 'debug';
import getHTTPError from "./http-errors.mjs";

const debug = debugInit("cmdb:api:movies")

const getMovies = handleMovies(getMoviesInternal)
const getTopMovies = handleMovies(getTopMoviesInternal)

const apiMovies = {
    getMovies,
    getTopMovies
}

export default apiMovies

async function getMoviesInternal(offset, limit, search) {
    debug(`Searching movies with title ${search}`)
    const movies = await cmdbServices.getMovies(offset, limit, search)
    return movies
}

// Get Top Movies
async function getTopMoviesInternal(offset, limit) {
    debug(`Getting top 250 movies`)
    const movies = await cmdbServices.getTopMovies(offset, limit)
    return movies
}


function handleMovies(handler) {
    return async function (req, rsp) {
        try {
            debug(`Handling request for ${req.originalUrl}`)
            const movies = await handler(req.query.offset, req.query.limit, req.query.search)
            rsp.json(movies)
        } catch (e) {
            debug(`Error handling request: %O`, e)
            const httpError = getHTTPError(e.code, e.message)
            rsp.status(httpError.status).json({error: httpError.message})
        }
    }
}
