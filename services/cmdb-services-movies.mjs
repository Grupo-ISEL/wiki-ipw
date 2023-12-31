// Module contains all management logic for movies
import error from "../errors.mjs"
import debugInit from 'debug'
import {MAX_LIMIT} from "./cmdb-services-constants.mjs"


export default function (moviesData) {
    // Validate arguments
    if (!moviesData)
        throw new Error("moviesData is mandatory")

    const debug = debugInit("cmdb:services:movies")

    return {
        getTopMovies: handleMovieRequest(getTopMovies),
        getMovies: handleMovieRequest(getMovies),
        getMovie,
    }

    // Get Top Movies
    async function getTopMovies(offset = 0, limit = 250) {
        debug(`getTopMovieswith offset ${offset} and limit ${limit}`)
        const movies = await moviesData.getTopMovies(offset, limit)
        //debug(`Found %O`, movies)
        if (!movies) {
            debug(`No movies found`)
            throw error.UNKNOWN("No movies found")
        }
        return movies
    }

    // Get Movies
    async function getMovies(offset = 0, limit = MAX_LIMIT, search_text) {
        debug(`getMovies with ${offset} offset limit ${limit} and search: ${search_text}`)
        if (!search_text)
            throw error.INVALID_PARAMETER("search string is required")

        const movies = await moviesData.getMovies(offset, limit, search_text)

        return movies
    }

    // Get Movie by ID
    async function getMovie(movieId) {
        debug(`getMovie with movieId: ${movieId}`)
        if (!movieId)
            throw error.INVALID_PARAMETER("movieId is required")

        const movie = await moviesData.getMovie(movieId)
        if (!movie) {
            debug(`No movie found with id ${movieId}`)
            throw error.MOVIE_NOT_FOUND(movieId)
        }
        return movie
    }

    // Handle Movie Request
    // Validate and sanitize input parameters
    // Call the appropriate function
    // Return the movie list
    function handleMovieRequest(action) {
        return async function (movieRequest) {
            const offset = Number(movieRequest.offset)
            const limit = Number(movieRequest.limit)
            if (isNaN(offset) || isNaN(limit)) {
                debug(`Invalid offset or limit: ${offset} - ${limit}`)
                throw error.INVALID_PARAMETER("Offset and limit must be numbers")
            }
            if (offset < 0 || limit < 0) {
                debug(`Invalid offset or limit: ${offset} - ${limit}`)
                throw error.INVALID_PARAMETER("Offset and limit must be positive")
            }
            if ( offset > MAX_LIMIT || limit > MAX_LIMIT)
                throw error.INVALID_PARAMETER(`Offset and limit must be less than or equal to ${MAX_LIMIT}`)

            debug(`Running action: ${action.name} search_text: ${movieRequest.search} offset: ${offset} limit: ${limit}`)
            return await action(offset, limit, movieRequest.search)
        }
    }
}
