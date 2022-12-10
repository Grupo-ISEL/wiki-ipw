// Module that contains the functions that handle all HTTP Website requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format


import getHTTPError from "../http-errors.mjs"
import debugInit from 'debug'

const debug = debugInit("cmdb:web:site")

function View(name, data) {
    this.name = name
    this.data = data
}

export default function (servicesGroups, servicesMovies, servicesUsers) {
    // Validate argument

    if (!servicesGroups)
        throw new Error("servicesGroups is mandatory")
    if (!servicesMovies)
        throw new Error("servicesMovies is mandatory")
    if (!servicesUsers)
        throw new Error("servicesUsers is mandatory")

    return {
        getGroup: handleRequest(getGroup),
        getGroups: handleRequest(getGroups),
        getNewGroupForm: getNewGroupForm,
        createGroup: handleRequest(createGroup),
        getSearchMovieForm: getSearchMovieForm,
        getTopMovies: handleRequest(getTopMovies),
        getMovie: handleRequest(getMovie),
    }

    async function getGroups(req, rsp) {
        const groups = await servicesGroups.getGroups(req.token, req.query.q, req.query.skip, req.query.limit)
        // debug (`getGroups: ${tasks}`)
        debug(`getGroups: %O`, groups)

        return new View('groups', {
            title: 'All groups', groups: groups.map(g => {
                return ({name: g.name, description: g.description, movies: g.movies, duration: g.totalDuration})
            }),
        })
    }

    async function getGroup(req, rsp) {
        const groupId = req.params.id
        const group = await servicesGroups.getGroup(req.token, groupId)
        return new View('group', group)
    }

    async function getNewGroupForm(req, rsp) {
        rsp.render('newGroup')
    }

    async function createGroup(req, rsp) {
        try {
            let group = await servicesGroups.createGroup(req.token, req.body)
            rsp.redirect(`/site/groups/`)
        } catch (e) {
            console.log(e)
            if (e.code === 1) {
                return new View('newGroup', req.body)
            }
            throw e
        }
    }

    async function getSearchMovieForm(req, rsp) {
        rsp.render('searchMovie')
    }

    async function getTopMovies(req, rsp) {
        const movieRequest = {
            offset: req.query.offset || 0, // TODO: Do this somewhere else
            limit: req.query.limit || 250, // TODO: Do this somewhere else
        }
        const movies = await servicesMovies.getTopMovies(movieRequest)
        debug(`getTopMovies: %O`, movies)
        return new View('topMovies', {
            title: 'Top Movies', movies: movies.map(m => {
                return ({id: m.id, title: m.title, rank: m.rank, year: m.year, imdbRating: m.imdbRating, image: m.imageUrl})
            }),
        })
    }

    async function getMovie(req, rsp) {
        const movieId = req.params.id
        const movie = await servicesMovies.getMovie(movieId)
        return new View('movie', movie)
    }

    function handleRequest(handler) {
        return async function (req, rsp) {
            req.token = 'abc'
            try {
                let view = await handler(req, rsp)
                if (view) {
                    debug(`Rendering view ${view.name} with data %O`, view.data)
                    rsp.render(view.name, view.data)
                }
            } catch (e) {
                const response = getHTTPError(e)
                rsp.status(response.status).json({error: response.body})
                console.log(e)
            }
        }
    }
}
