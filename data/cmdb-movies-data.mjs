// Module manages application data.
// In this specific module, data is stored in memory

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


function getMovies() {
    console.log("getMovies");
    return movies ? Promise.resolve(movies) : Promise.reject("No movies found")
}


const moviesData = {
    getMovies
}

export default moviesData
