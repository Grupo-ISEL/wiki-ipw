// TODO: Only return some movie fields
import {readFile} from "node:fs/promises";
import debugInit from "debug";
import error from "../errors.mjs";

const movies = [
    {
        id: "tt1790736",
        title: "The Shawshank Redemption",
        year: 1994,
        runtimeMins: "142",
        imdbRating: "9.3",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        description: "Two imprisoned bla bla",
        directors: "Frank Darabont",
        writers: "Stephen King (short story \"Rita Hayworth and Shawshank Redemption\"), Frank Darabont (screenplay)",
        actors: [
            { name: "Tim Robbins", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
            { name: "Morgan Freeman", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
        ]
    },
    {
        id: "tt5295990",
        title: "The Godfather",
        year: 1972,
        runtimeMins: "175",
        imdbRating: "9.2",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        description: "The aging patriarch of an bla bla",
        directors: "Francis Ford Coppola",
        writers: "Mario Puzo (screenplay by), Francis Ford Coppola (screenplay by)",
        actors: [
            { name: "Marlon Brando", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
            { name: "Al Pacino", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
        ]
    },
    {
        id: "tt1686778",
        title: "The Godfather: Part II",
        year: 1974,
        runtimeMins: "202",
        imdbRating: "9.0",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        description: "The early life and bla bla",
        directors: "Francis Ford Coppola",
        writers: "Mario Puzo (screenplay by), Francis Ford Coppola (screenplay by)",
        actors: [
            { name: "Al Pacino", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
            { name: "Robert De Niro", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
        ]
    },
    {
        id: "tt12960252",
        title: "The Dark Knight",
        year: 2008,
        runtimeMins: "152",
        imdbRating: "9.0",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        description: "When the menace known bla bla",
        directors: "Christopher Nolan",
        writers: "Jonathan Nolan (screenplay by), Christopher Nolan (screenplay by)",
        actors: [
            { name: "Christian Bale", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
            { name: "Heath Ledger", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
        ]
    },
    {
        id: "tt1375666",
        title: "Inception",
        year: "2010",
        runtimeMins: "148",
        imdbRating: "8.8",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        description: "A thief who steals bla bla",
        directors: "Christopher Nolan",
        writers: "Christopher Nolan",
        actors: [
            { name: "Leonardo DiCaprio", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
            { name: "Joseph Gordon-Levitt", imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg" },
        ]
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

