import error from "../errors.mjs";
import debugInit from 'debug';
import nodeFetch from 'node-fetch'
import {MAX_LIMIT} from "./cmdb-services-constants.mjs";


export default function (moviesInit, fetchModule) {
    // Validate arguments
    if (!moviesInit) {
        throw new Error("moviesData is mandatory")
    }

    const debug = debugInit("cmdb:services:movies")
    if (!fetchModule) {
        debug("fetchModule not provided, using node-fetch")
    }
    // Use default node-fetch if not provided
    const fetch = nodeFetch || fetchModule

    // Initialize moviesData module with fetch function
    const moviesData = moviesInit(fetch)


    return {
        getTopMovies: handleMovieRequest(getTopMoviesInternal),
        getMovies: handleMovieRequest(getMoviesInternal),
        getMovie,
    }

    // Get Top Movies
    async function getTopMoviesInternal(offset = 0, limit = 250) {
        debug(`getTopMoviesInternal with offset ${offset} and limit ${limit}`)
        const movies = await moviesData.getTopMovies(offset, limit)
        //debug(`Found %O`, movies)
        if (!movies) {
            debug(`No movies found`)
            throw error.UNKNOWN("No movies found")
        }
        return movies
    }

    // Get Movies
    async function getMoviesInternal(offset = 0, limit = MAX_LIMIT, search_text) {
        debug(`getMoviesInternal with ${offset} limit ${limit} and search: ${search_text}`)
        if (!search_text)
            throw error.INVALID_PARAMETER("search string is required")

        return await moviesData.getMovies(offset, limit, search_text)
    }

    // Get Movie by ID
    async function getMovie(movieId) {
        debug(`getMovie with movieId: ${movieId}`)
        if (!movieId)
            throw error.INVALID_PARAMETER("movieId is required")

        return await moviesData.getMoviebyId(movieId);
    }

    // Handle Movie Request
    // Validate and sanitize input parameters
    // Call the appropriate function
    // Return the movie list
    function handleMovieRequest(action) {
        return async function (offset = 0, limit = MAX_LIMIT, search_text) {
            offset = Number(offset)
            limit = Number(limit)
            if (isNaN(offset) || isNaN(limit)) {
                debug(`Invalid offset or limit: ${offset} - ${limit}`)
                throw error.INVALID_PARAMETER("Offset and limit must be numbers")
            }
            if (offset < 0 || limit < 0) {
                debug(`Invalid offset or limit: ${offset} - ${limit}`)
                throw error.INVALID_PARAMETER("Offset and limit must be positive")
            }
            if ( offset > MAX_LIMIT || limit > MAX_LIMIT) {
                throw error.INVALID_PARAMETER(`Offset and limit must be less than or equal to ${MAX_LIMIT}`)
            }
            debug(`Running action: ${action.name} search_text: ${search_text} offset: ${offset} limit: ${limit}`)
            const movies = await action(offset, limit, search_text)
            return movies
        }
    }
}
