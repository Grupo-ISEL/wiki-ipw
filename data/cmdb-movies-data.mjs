// Module movies data
// access to the Internet Movies Database API.
import fetch from 'node-fetch'
import {readFile} from 'node:fs/promises'

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

const TOP_250 = "./top250.json"
const API_KEY = getApiKey()
const IMDB_API_DISABLED = true

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
async function getMovies(search, offset, limit) {
    console.log("movies-data-getMovies");
    if (search) {
        return await searchMovie(search)
    }
}

// Not used at the moment
function getMoviebyId(movieId) {
    console.log("getMoviebyId");
    return movies.find(movie => movie.id === movieId)
}

// Not used at the moment
async function getMovie(movieId) {
    console.log("getMovie from IMDB");
    const url = `https://imdb-api.com/en/API/Title/${API_KEY}/${movieId}`
    return fetchFromImdb(url)
}

// TODO: Figure out which fields to return and if we need to fetch more data from the API, i.e. runtime
async function searchMovie(search_text) {
    console.log("searchMovie");
    if (IMDB_API_DISABLED) {
        return searchMovieLocal(search_text)
    }
    const url = `https://imdb-api.com/en/API/SearchMovie/${API_KEY}/${search_text}`
    return fetchFromImdb(url)
}

async function searchMovieLocal(search_text) {
    console.log("searchMovieLocal");
    return movies.filter(movie => movie.title.toLowerCase().includes(search_text.toLowerCase()))
}


async function getTopMovies() {
    console.log("getTopMovies");
    if (IMDB_API_DISABLED) {
        return getTopMoviesLocal()
    }
    const url = `https://imdb-api.com/en/API/Top250Movies/${API_KEY}`
    return fetchFromImdb(url)
}

// TODO: Only return some movie fields
async function getTopMoviesLocal() {
    console.log("getTopMoviesLocal");
    const movies = await readFile(TOP_250)
    return JSON.parse(movies)
}

async function fetchFromImdb(url) {
    console.log("fetchFromImdb");
    const response = await fetch(url)
    const data = response.json()
    const errMsg = data["errorMessage"]
    if(!errMsg)
         throw errMsg
    return data["results"]
}

const moviesData = {
    getMoviebyId,
    getMovies,
    getTopMovies,
    searchMovie
}

export default moviesData
