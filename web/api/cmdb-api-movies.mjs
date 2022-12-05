// List all movies
import debugInit from 'debug';
import getHTTPError from "./http-errors.mjs";

export default function(moviesServices) {

    if (!moviesServices) {
        throw new Error("moviesServices is mandatory")
    }
    const debug = debugInit("cmdb:api:movies")

    return {
        getMovies: handleMovies(getMoviesInternal),
        getTopMovies: handleMovies(getTopMoviesInternal)
    }

    async function getMoviesInternal(offset, limit, search) {
        debug(`Searching movies with title ${search}`)
        const movies = await moviesServices.getMovies(offset, limit, search)
        return movies
    }

    // Get Top Movies
    async function getTopMoviesInternal(offset, limit) {
        debug(`Getting top 250 movies`)
        const movies = await moviesServices.getTopMovies(offset, limit)
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
                const httpError = getHTTPError(e.code, e.message || e)
                rsp.status(httpError.status).json({error: httpError.message})
            }
        }
    }
}
