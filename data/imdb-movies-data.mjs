// Module movies data
// access to the Internet Movies Database API.
import debugInit from 'debug';
import error from '../errors.mjs'
import {MAX_LIMIT} from "../services/cmdb-services-constants.mjs";

// MusicVideo type is not valid
// fetchFromImdb errMsg: Year is empty


export default function (fetchModule) {

    if (!fetchModule)
        throw new Error("fetchModule is mandatory")

    const debug = debugInit("cmdb:imdb:data:movies")

    // TODO: Init module with API key?
    //const API_KEY = "k_1234abcd"
    const API_KEY = getApiKey()

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
    async function getMovies(offset, limit, search) {
        debug(`getMovies with search: ${search}, offset: ${offset}, limit: ${limit}`)
        if (search) {
            const res = await searchMovie(search)
            if (!res)
                throw error.UNKNOWN(res.errorMessage)
            const end = calculateEnd(offset, limit, res.length)
            const results = res.slice(offset, end)
            const movies = await Promise.all(results.map(async movie => await getMovie(movie.id)))
            debug(`getMovies found %O`, movies)
            return movies
        }
        debug(`No search text`)
        return []
    }

    async function getMovieDuration(movieId) {
        const movie = await getMovie(movieId)
        debug(`getMovieDuration for movieId: ${movieId} duration: ${Number(movie.runtimeMins)}`)
        return Number(movie.runtimeMins)
    }

    // Get Movie by IMDB ID
    async function getMovie(movieId) {
        if (!movieId)
            throw error.INVALID_PARAMETER("movieId is mandatory")
        debug(`getMovie with movieId: ${movieId}`)
        const url = `https://imdb-api.com/en/API/Title/${API_KEY}/${movieId}`
        const response = await fetchFromImdb(url)
        // debug(`getMovie response: %O`, response)
        const parsedMovie = parseMovie(response)
        debug(`getMovie parsedMovie: %O`, parsedMovie)
        return parsedMovie
    }

    function parseMovie(movie) {
        return {
            id: movie.id,
            title: movie.title,
            year: Number(movie.year) || movie.year,
            runtimeMins: Number(movie.runtimeMins) || movie.runtimeMins,
            imdbRating: Number(movie.imDbRating) || movie.imDbRating ,
            imageUrl: movie.image,
            description: movie.plot,
            directors: movie.directors,
            writers: movie.writers,
            actors: movie.actorList ? movie.actorList.map(actor => ({ name: actor.name, imageUrl: actor.image })) : movie.actorList,
        }
    }

    async function searchMovie(search_text) {
        debug(`searchMovie with search_text: ${search_text}`)
        const url = `https://imdb-api.com/en/API/SearchMovie/${API_KEY}/${search_text}`
        const searchResults = await fetchFromImdb(url)
        return searchResults["results"]
    }

    // Fetches the top 250 movies from IMDB API
    async function getTopMovies(offset, limit) {
        debug("getTopMovies")
        const url = `https://imdb-api.com/en/API/Top250Movies/${API_KEY}`
        let topMovies = []
        topMovies = (await fetchFromImdb(url))["items"]
        topMovies = topMovies.map(m => {
            return {id: m.id, title: m.title, rank: m.rank, year: m.year, imdbRating: m.imDbRating, imageUrl: m.image}
        })
        //debug(`getTopMovies topMovies: %O`, topMovies)
        const end = calculateEnd(offset, limit, topMovies.length)
        debug(`getTopMovies offset: ${offset} end: ${end}`)
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
            debug(`fetchFromImdb ${url} errMsg: ${errMsg}`)
            if (errMsg.includes("Year is empty"))
                return data
                // throw error.INVALID_PARAMETER(errMsg)
            if (errMsg.includes("MusicVideo type is not valid"))
                return data
                // throw error.NOT_FOUND(errMsg)
            throw error.UNKNOWN(errMsg)
        }
        return data
    }

    function calculateEnd(offset, limit, total) {
        return limit < MAX_LIMIT ? offset + limit : total
    }
}
