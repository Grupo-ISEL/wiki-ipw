// Module movies data
// access to the Internet Movies Database API.
import fetch from 'node-fetch'
import {readFile} from 'node:fs/promises'
import debugInit from 'debug';

const debug = debugInit("cmdb:imdb:data:movies")

let movies = [
    {
        id: "tt1",
        title: "The Shawshank Redemption",
        runtime: 142,
    },
    {
        id: "tt2",
        title: "The Godfather",
        runtime: 175,
    },
    {
        id: "tt3",
        title: "The Godfather: Part II",
        runtime: 202,
    },
    {
        id: "tt4",
        title: "The Dark Knight",
        runtime: 152,
    }
]

const TOP_250 = "./data/top250.json"
const SEARCH_MOVIES = "./data/search.json"
const API_KEY = getApiKey()
const IMDB_API_DISABLED = false
const MAX_LIMIT = 250

function getApiKey() {
    if (process.env.hasOwnProperty("IMDB_API_KEY") && process.env["IMDB_API_KEY"] !== "")
        return process.env.IMDB_API_KEY
    else
        throw new Error("IMDB_API_KEY is not set in environment variables.")
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
    let movies = []
    const end = limit < MAX_LIMIT ? offset + limit : movies.length
    if (search) {
        movies = await searchMovie(search).map(movie => {
            return {id: movie.id, title: movie.title, runtime: 100}
        })
        return movies.map(movie => {
            return {id: movie.id, title: movie.title, runtime: 100}
        }).slice(offset, end)
    } else {
        debug(`No search text`)
        return []
    }
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
    if (IMDB_API_DISABLED) {
        return await searchMovieLocal(search_text)
    }
    const url = `https://imdb-api.com/en/API/SearchMovie/${API_KEY}/${search_text}`
    return (await fetchFromImdb(url))["results"]
}

async function searchMovieLocal(search_text) {
    debug(`searchMovieLocal with search_text: ${search_text}`)
    return movies.filter(movie => movie.title.toLowerCase().includes(search_text.toLowerCase()))
}


async function getTopMovies(offset, limit) {
    debug("getTopMovies")
    let topMovies = []
    if (IMDB_API_DISABLED) {
        topMovies = await getTopMoviesLocal()
        //  debug(`getTopMovies topMovies: %O`, topMovies)
    } else {
        const url = `https://imdb-api.com/en/API/Top250Movies/${API_KEY}`
        topMovies = (await fetchFromImdb(url))["items"]
        topMovies = topMovies.map(movie => {
            return {id: movie.id, title: movie.title, rank: movie.rank}
        })
        debug(`getTopMovies topMovies: %O`, topMovies)
    }
    const end = limit < MAX_LIMIT ? offset + limit : topMovies.length
    return topMovies.slice(offset, end)
}

// TODO: Only return some movie fields
async function getTopMoviesLocal() {
    //debug(`getTopMoviesLocal cwd: ${process.cwd()}`)
    const movies = await readFile(TOP_250, "utf-8")
    //debug(`getTopMoviesLocal movies: %O`, movies)
    const parsed = JSON.parse(movies)["items"]
    //debug(`getTopMoviesLocal parsed: %O`, parsed)
    return parsed
}

async function fetchFromImdb(url) {
    debug(`fetchFromImdb with url: ${url}`)
    const response = await fetch(url)
    const data = await response.json()
    const errMsg = data["errorMessage"]
    debug(`fetchFromImdb data: ${data}`)
    if (errMsg){
        debug(`fetchFromImdb errMsg: ${errMsg}`)
        throw errMsg
    }
    return data
}

const moviesData = {
    getMoviebyId,
    getMovies,
    getTopMovies,
    searchMovie
}

export default moviesData
