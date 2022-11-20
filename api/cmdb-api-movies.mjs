// List all movies
import cmdbServices from "../services/cmdb-services-movies.mjs";
import debugInit from 'debug';
import getHTTPError from "./http-errors.mjs";

const debug = debugInit("cmdb:api:movies")

async function getMovies(req, rsp) {
    debug(`Searching movies with title ${req.query.search}`)
    if (!req.query.search) {
        rsp.status(400).json({error: "Missing search parameter"})
        return
    }
    try {
        const movies = await cmdbServices.getMovies(req.query.offset, req.query.limit, req.query.search)
        rsp.status(200).json(movies)
    } catch (e) {
        const httpError = getHTTPError(e.error, e.message)
        rsp.status(httpError.status).json({error: httpError.message})
    }
}

// Get Top Movies
async function getTopMovies(req, rsp) {
    debug(`Getting top 250 movies`)
    try {
        const movies = await cmdbServices.getTopMovies(req.query.limit, req.query.offset)
        rsp.status(200).json(movies)
    } catch (e) {
        const httpError = getHTTPError(e.error, e.message)
        rsp.status(httpError.status).json({error: httpError.message})
    }
}

const apiMovies = {
    getMovies,
    getTopMovies
}

export default apiMovies
