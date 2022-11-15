// List all movies
import cmdbServices from "../services/cmdb-services-groups.mjs";

async function getMovies(req, rsp) {
    console.log(`Searching movies with text ${req.query.search}`)
    const movies = await cmdbServices.getMovies(req.query.search, req.query.limit, req.query.offset)

    if (movies) {
        rsp.status(200).json(movies)
    } else {
        rsp.status(500).json({error: `Error getting movies`})
    }
}

// Get Top Movies
function getTopMovies(req, rsp) {
    throw new Error("Not implemented")
}

const apiMovies = {
    getMovies,
    getTopMovies
}

export default apiMovies
