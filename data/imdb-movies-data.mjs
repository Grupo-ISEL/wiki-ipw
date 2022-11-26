// Module movies data
// access to the Internet Movies Database API.
import debugInit from 'debug';
import error from '../errors.mjs'
import {MAX_LIMIT} from "../services/cmdb-services-constants.mjs";


export default function (fetchModule) {

    if (!fetchModule) {
        throw new Error("fetchModule is mandatory")
    }

    const debug = debugInit("cmdb:imdb:data:movies")

    // TODO: Init module with API key?
    const API_KEY = "k_123abc"
    //const API_KEY = getApiKey()

    // Reads the IMDB API key from an environment variable if it exists
    function getApiKey() {
        if (process.env.hasOwnProperty("IMDB_API_KEY") && process.env["IMDB_API_KEY"] !== "")
            return process.env.IMDB_API_KEY
        else
            throw error.UNKNOWN("IMDB_API_KEY not set")
    }
    const fetch = fetchModule
    debug(`fetchModule provided ${fetchModule.name}`)

    return {
        getMovies,
        getMoviebyId,
        getMovie,
        getTopMovies
    }

    /*
     Example search api calls
     https://imdb-api.com/en/API/SearchMovie/API_KEY/inception 2010
     https://imdb-api.com/en/API/SearchMovie/API_KEY/leon the professional
     https://imdb-api.com/en/API/SearchMovie/API_KEY/the patriot 2000
    */

    // TODO: Figure out which fields to return and if we need to fetch more data from the API, i.e. runtime
    // TODO: Handle offset and limit
    async function getMovies(offset, limit, search) {
        debug(`getMovies with search: ${search}, offset: ${offset}, limit: ${limit}`)
        const end = limit < MAX_LIMIT ? offset + limit : movies.length
        if (search) {
            const movies = await searchMovie(search).map(movie => ({id: movie.id, title: movie.title, runtime: 100})) // TODO: Use runtime from API
            return movies.slice(offset, end)
        }
        debug(`No search text`)
        return []
    }

    // Not used at the moment
    async function getMoviebyId(movieId) {
        debug(`getMoviebyId with movieId: ${movieId}`)
        return movies.find(movie => movie.id === movieId)
    }

    // Not used at the moment
    async function getMovie(movieId) {
        debug(`getMovie with movieId: ${movieId}`)
        const url = `https://imdb-api.com/en/API/Title/${API_KEY}/${movieId}`
        return await fetchFromImdb(url)
    }

    // TODO: Figure out which fields to return and if we need to fetch more data from the API, i.e. runtime
    async function searchMovie(search_text) {
        debug(`searchMovie with search_text: ${search_text}`)
        const url = `https://imdb-api.com/en/API/SearchMovie/${API_KEY}/${search_text}`
        return (await fetchFromImdb(url))["results"]
    }

    // Fetches the top 250 movies from IMDB API
    async function getTopMovies(offset, limit) {
        debug("getTopMovies")
        const url = `https://imdb-api.com/en/API/Top250Movies/${API_KEY}`
        let topMovies = []

        topMovies = (await fetchFromImdb(url))["items"]
        topMovies = topMovies.map(movie => { return {id: movie.id, title: movie.title, rank: movie.rank} })
        //debug(`getTopMovies topMovies: %O`, topMovies)
        const end = limit < MAX_LIMIT ? offset + limit : topMovies.length
        return topMovies.slice(offset, end)
    }

    // Fetch data from IMDB API
    async function fetchFromImdb(url) {
        debug(`fetchFromImdb with url: ${url}`)
        let data
        try {
            const response = await fetch(url)
            data = await response.json()
        } catch (e) {
            debug(`fetchFromImdb error: %O`, e)
            throw error.UNKNOWN(e)
        }
        //debug(`fetchFromImdb data: %o`, data)
        const errMsg = data["errorMessage"]
        if (errMsg) {
            debug(`fetchFromImdb errMsg: ${errMsg}`)
            throw error.UNKNOWN(errMsg)
        }
        return data
    }
}
