import cmdbMoviesData from "../data/imdb-movies-data.mjs";
import error from "../errors.mjs";
import debugInit from 'debug';

const debug = debugInit("cmdb:services:movies")

const MAX_LIMIT = 250

const getTopMovies = handleMovieRequest(getTopMoviesInternal)
const getMovies = handleMovieRequest(getMoviesInternal)

const servicesMovies = {
    getTopMovies,
    getMovies
}

export default servicesMovies

async function getTopMoviesInternal(offset = 0, limit = 250) {
    debug(`getTopMoviesInternal with offset ${offset} and limit ${limit}`)
    const topMovies = await cmdbMoviesData.getTopMovies(offset, limit)
    return topMovies
}

async function getMoviesInternal(offset = 0, limit = MAX_LIMIT, search_text) {
    debug(`getMoviesInternal with ${offset} limit ${limit} and search: ${search_text}`)
    if (!search_text)
        throw error.INVALID_PARAMETER("search string is required")

    const movies = await cmdbMoviesData.getMovies(offset, limit, search_text)
    return movies
}


// Validate offset and limit
// Call data layer
// Return results

async function handleMovieRequest(action) {

    return async function (offset = 0, limit = MAX_LIMIT, search_text) {

        if (isNaN(offset) || isNaN(limit)) {
            throw error.INVALID_PARAMETER("Offset and limit must be numbers")
        }
        if (offset < 0 || limit < 0) {
            throw error.INVALID_PARAMETER("Offset and limit must be positive")
        }
        if (limit > MAX_LIMIT || offset + limit > MAX_LIMIT) {
            throw error.INVALID_PARAMETER(`Limit and Offset+Limit must be less than or equal to ${MAX_LIMIT}`)
        }
        debug(`Running action: search_text: ${search_text} offset: ${offset} limit: ${limit}`)
        return action(offset, limit, search_text)
    }
}
