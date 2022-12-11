// TODO: Only return some movie fields
import {readFile} from "node:fs/promises";
import debugInit from "debug";
import error from "../errors.mjs";

const movies = [
    {
        id: "tt0111161",
        title: "The Shawshank Redemption",
        year: 1994,
        runtimeMins: "142",
        imDbRating: "9.3",
        image: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        plot: "Two imprisoned bla bla",
        directors: "Frank Darabont",
        writers: "Stephen King (short story \"Rita Hayworth and Shawshank Redemption\"), Frank Darabont (screenplay)",
        actorList: [
            { name: "Tim Robbins", image: "https://m.media-amazon.com/images/M/MV5BMTI1OTYxNzAxOF5BMl5BanBnXkFtZTYwNTE5ODI4._V1_Ratio1.0000_AL_.jpg" },
            { name: "Morgan Freeman", image: "https://m.media-amazon.com/images/M/MV5BMTc0MDMyMzI2OF5BMl5BanBnXkFtZTcwMzM2OTk1MQ@@._V1_Ratio1.0000_AL_.jpg" },
        ]
    },
    {
        id: "tt0068646",
        title: "The Godfather",
        year: 1972,
        runtimeMins: "175",
        imDbRating: "9.2",
        image: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        plot: "The aging patriarch of an bla bla",
        directors: "Francis Ford Coppola",
        writers: "Mario Puzo (screenplay by), Francis Ford Coppola (screenplay by)",
        actorList: [
            { name: "Marlon Brando", image: "https://m.media-amazon.com/images/M/MV5BMTg3MDYyMDE5OF5BMl5BanBnXkFtZTcwNjgyNTEzNA@@._V1_Ratio1.3000_AL_.jpg" },
            { name: "Al Pacino", image: "https://m.media-amazon.com/images/M/MV5BMTQzMzg1ODAyNl5BMl5BanBnXkFtZTYwMjAxODQ1._V1_Ratio1.0000_AL_.jpg" },
        ]
    },
    {
        id: "tt0071562",
        title: "The Godfather: Part II",
        year: 1974,
        runtimeMins: "202",
        imDbRating: "9.0",
        image: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        plot: "The early life and bla bla",
        directors: "Francis Ford Coppola",
        writers: "Mario Puzo (screenplay by), Francis Ford Coppola (screenplay by)",
        actorList: [
            { name: "Al Pacino", image: "https://m.media-amazon.com/images/M/MV5BMTQzMzg1ODAyNl5BMl5BanBnXkFtZTYwMjAxODQ1._V1_Ratio1.0000_AL_.jpg" },
            { name: "Robert De Niro", image: "https://m.media-amazon.com/images/M/MV5BMTQzMzg1ODAyNl5BMl5BanBnXkFtZTYwMjAxODQ1._V1_Ratio1.0000_AL_.jpg" },
        ]
    },
    {
        id: "tt0468569",
        title: "The Dark Knight",
        year: 2008,
        runtimeMins: "152",
        imDbRating: "9.0",
        image: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        plot: "When the menace known bla bla",
        directors: "Christopher Nolan",
        writers: "Jonathan Nolan (screenplay by), Christopher Nolan (screenplay by)",
        actorList: [
            { name: "Christian Bale", image: "https://m.media-amazon.com/images/M/MV5BMTkxMzk4MjQ4MF5BMl5BanBnXkFtZTcwMzExODQxOA@@._V1_Ratio1.0000_AL_.jpg" },
            { name: "Heath Ledger", image: "https://m.media-amazon.com/images/M/MV5BMTI2NTY0NzA4MF5BMl5BanBnXkFtZTYwMjE1MDE0._V1_Ratio1.0000_AL_.jpg" },
        ]
    },
    {
        id: "tt1375666",
        title: "Inception",
        year: "2010",
        runtimeMins: "148",
        imDbRating: "8.8",
        image: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
        plot: "A thief who steals bla bla",
        directors: "Christopher Nolan",
        writers: "Christopher Nolan",
        actorList: [
            { name: "Leonardo DiCaprio", image: "https://m.media-amazon.com/images/M/MV5BMjI0MTg3MzI0M15BMl5BanBnXkFtZTcwMzQyODU2Mw@@._V1_Ratio1.0000_AL_.jpg" },
            { name: "Joseph Gordon-Levitt", image: "https://m.media-amazon.com/images/M/MV5BMTY3NTk0NDI3Ml5BMl5BanBnXkFtZTgwNDA3NjY0MjE@._V1_Ratio1.0000_AL_.jpg" },
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
            return {json: () => ({items: [], errorMessage: "Invalid URL"})}
    }
}

