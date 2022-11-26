// TODO: Only return some movie fields
import {readFile} from "node:fs/promises";
import debugInit from "debug";

const movies = [
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

const TOP_250_FILE = "./top250.json"
const SEARCH_MOVIES = "./search.json"

const IMDB_URLS = {
    SEARCH: "https://imdb-api.com/en/API/SearchMovie/",
    TOP_250: "https://imdb-api.com/en/API/Top250Movies/",
    MOVIE: "https://imdb-api.com/en/API/Title/",
}

const debug = debugInit("cmdb:imdb-mock-data")

export default async function (url) {
    // Mock fetch from IMDB with IMDB_URLs
    // TODO: NOT COMPLETE YET
    debug(`fetch with url: ${url}`)
    // If we have a search url, return the search results
    if (url.includes(IMDB_URLS.SEARCH)) {
        const data = await readFile(SEARCH_MOVIES, "utf8")
        return {json: () => JSON.parse(data)}
    }
    // If we have a top 250 url, return the top 250 results
    if (url.includes(IMDB_URLS.TOP_250)) {
        const data = await readFile(TOP_250_FILE, "utf8")
        return {json: () => JSON.parse(data)}
    }
    // If we have a movie url, return the movie
    if (url.includes(IMDB_URLS.MOVIE)) {
        const movieId = url.split("/").pop()
        const movie = movies.find(movie => movie.id === movieId)
        return {json: () => movie}
    }
}

