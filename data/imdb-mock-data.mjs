// TODO: Only return some movie fields
import {readFile} from "node:fs/promises";
import debugInit from "debug";
import error from "../errors.mjs";

const movies = [
    {
        id: "tt1790736",
        title: "The Shawshank Redemption",
        runtimeMins: "142",
    },
    {
        id: "tt5295990",
        title: "The Godfather",
        runtimeMins: "175",
    },
    {
        id: "tt1686778",
        title: "The Godfather: Part II",
        runtimeMins: "202",
    },
    {
        id: "tt12960252",
        title: "The Dark Knight",
        runtimeMins: "152",
    },
    {
        id: "tt1375666",
        title: "Inception",
        year: "2010",
        runtimeMins: "148",
    }
]

const TOP_250_FILE = "./data/top250.json"
const SEARCH_MOVIES = "./data/search.json"

const IMDB_API = {
    SEARCH: "SearchMovie",
    TOP_250: "Top250Movies",
    MOVIE: "Title",
}
// Mock API Key for testing
const VALID_API_KEY = "k_1234abcd"

const debug = debugInit("cmdb:imdb-mock-data")

export default async function (url) {
    // Mock fetch from IMDB with IMDB_URLs
    debug(`mock fetch with url: ${url}`)

    const regexp = url.match("https:\/\/imdb-api.com\/en\/API\/(?<ACTION>Top250Movies|SearchMovie|Title)\/?(?<API_KEY>[^\/]+)?\/?(?<TEXT>[^\/]+)?\/?$")
    const action = regexp.groups.ACTION
    const apiKey = regexp.groups.API_KEY
    const text = regexp.groups.TEXT

    debug(`action: ${action}, apiKey: ${apiKey}, text: ${text}`)
    // Validate API key
    if (apiKey !== VALID_API_KEY) {
        debug(`Invalid API key: ${apiKey}`)
        return {json: () => ({items: [], errorMessage: "Invalid API key"})}
    } else
        debug(`Valid API key: ${apiKey}`)

    switch (action) {
        case IMDB_API.TOP_250:
            const top250 = await readFile(TOP_250_FILE, "utf8")
            if (!top250) {
                throw error.UNKNOWN()
            }
            return {json: () => JSON.parse(top250)}
        case IMDB_API.SEARCH:
            const results = movies.filter(movie => movie.title.toLowerCase().includes(text.toLowerCase())) || []
            debug(`results: %O`, results)
            return {json: () => ({searchType: "Title", expression: text, results: results, errorMessage: ""})}
        case IMDB_API.MOVIE:
            const movie = movies.find(movie => movie.id === text) || {}
            debug(`mock getMovie: %O`, movie)
            return {
                json: () => ({...movie, errorMessage: ""})
            }
        default:
            //If we have an invalid url, return an error
            debug(`mock invalid url: ${url}`)
            return {json: () => ({items: [], errorMessage: "Invalid url"})}
    }
}

