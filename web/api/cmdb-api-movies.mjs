import debugInit from 'debug';
import getHTTPError from "./http-errors.mjs";

export default function (moviesServices) {

    if (!moviesServices)
        throw new Error("moviesServices is mandatory")
    const debug = debugInit("cmdb:api:movies")

    return {
        getMovie: handleMoviesRequest(getMovie),
        getMovies: handleMoviesRequest(getMovies),
        getTopMovies: handleMoviesRequest(getTopMovies)
    }

    async function getMovie(movieRequest) {
        debug(`getMovie with id: ${movieRequest.id}`)
        return await moviesServices.getMovie(movieRequest.id)
    }

    async function getMovies(movieRequest) {
        debug(`Searching movies with title ${movieRequest.search}`)
        return await moviesServices.getMovies(movieRequest.offset, movieRequest.limit, movieRequest.search)
    }

    // Get Top Movies
    async function getTopMovies(movieRequest) {
        debug(`Getting top 250 movies`)
        return await moviesServices.getTopMovies(movieRequest.offset, movieRequest.limit)
    }

    function handleMoviesRequest(handler) {
        return async function (req, rsp) {
            try {
                debug(`Handling movie request for ${req.originalUrl}`)
                // TODO: Should we use the request to store the movieRequest?
                req.movieRequest = {
                    id: req.params.id,
                    offset: req.query.offset,
                    limit: req.query.limit,
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
