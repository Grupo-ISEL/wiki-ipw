import cmdbMoviesData from "../data/cmdb-movies-data.mjs";
import error from "../errors.mjs";

const MAX_LIMIT = 250


const getTopMovies = handleMovieRequest(getTopMoviesInternal)
const getMovies = handleMovieRequest(getMoviesInternal)

const servicesMovies = {
    getTopMovies,
    getMovies
}

export default servicesMovies

async function getTopMoviesInternal(offset = 0, limit = 250) {
    console.log("services-getTopMovies");
    const topMovies = await cmdbMoviesData.getTopMovies(offset, limit)
    return topMovies
}

async function getMoviesInternal(search_text, offset = 0, limit = MAX_LIMIT) {
    console.log("services-getMovies")
    if (!search_text)
        throw error.INVALID_PARAMETER("search string is required")

    const movies = await cmdbMoviesData.getMovies(search_text, offset, limit)
    return movies
}


// Validate offset and limit
// Call data layer
// Return results

async function handleMovieRequest(action) {

    return async function (search_text, offset = 0, limit = MAX_LIMIT) {

        if (isNaN(offset) || isNaN(limit)) {
            throw error.INVALID_PARAMETER("Offset and limit must be numbers")
        }
        if (offset < 0 || limit < 0) {
            throw error.INVALID_PARAMETER("Offset and limit must be positive")
        }
        if (limit > MAX_LIMIT || offset + limit > MAX_LIMIT) {
            throw error.INVALID_PARAMETER(`Limit and Offset+Limit must be less than or equal to ${MAX_LIMIT}`)
        }
        return action(search_text, offset, limit)
    }


}


function handleTokenValidation(action)  {
    return async function (token, groupId=null,  movieId=null) {
        const userId = await validateToken(token)
        if (userId) {
            console.log(`Running action: groupId: ${groupId} userId: ${userId} movieId: ${movieId}`)
            return action(groupId,userId,movieId)
        }
        throw new error(1, 'No user with the given token')
    }
}
