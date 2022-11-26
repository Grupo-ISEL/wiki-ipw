// TODO: Only return some movie fields
import {readFile} from "node:fs/promises";
import debugInit from "debug";
import error from "../errors.mjs";

const movies = [
    {
        id: "tt1",
        title: "The Shawshank Redemption",
        runtimeMins: 142,
    },
    {
        id: "tt2",
        title: "The Godfather",
        runtimeMins: 175,
    },
    {
        id: "tt3",
        title: "The Godfather: Part II",
        runtimeMins: 202,
    },
    {
        id: "tt4",
        title: "The Dark Knight",
        runtimeMins: 152,
    }
]

const TOP_250_FILE = "./data/top250.json"
const SEARCH_MOVIES = "./data/search.json"

const IMDB_URLS = {
    SEARCH: "https://imdb-api.com/en/API/SearchMovie/",
    TOP_250: "https://imdb-api.com/en/API/Top250Movies/",
    MOVIE: "https://imdb-api.com/en/API/Title/",
}

const debug = debugInit("cmdb:imdb-mock-data")

export default async function (url) {
    // Mock fetch from IMDB with IMDB_URLs
    // TODO: Parse API key from url and validate it
    // TODO: Extract search text from url
    debug(`mock fetch with url: ${url}`)
    // If we have a search url, return the search results
    if (url.startsWith(IMDB_URLS.SEARCH)) {
        const data = await readFile(SEARCH_MOVIES, "utf8")
        return {json: () => JSON.parse(data)}
    }
    // If we have a top 250 url, return the top 250 results
    if (url.startsWith(IMDB_URLS.TOP_250)) {
        const data = await readFile(TOP_250_FILE, "utf8")
        if(!data) {
            throw error.UNKNOWN()
        }
        return {json: () => JSON.parse(data)}
    }
    // If we have a movie url, return the movie
    if (url.startsWith(IMDB_URLS.MOVIE)) {
        const movieId = url.split("/").pop()
        const movie = movies.find(movie => movie.id === movieId)
        if (!movie) {
            throw error.MOVIE_NOT_FOUND(movieId)
        }
        return {json: () => movie}
    }
}

