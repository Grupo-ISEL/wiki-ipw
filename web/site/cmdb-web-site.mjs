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
        createGroup: handleRequest(createGroup),
        getTopMovies: handleRequest(getTopMovies),
        getMovie: handleRequest(getMovie),
        getMovies: handleRequest(getMovies),
        getEditGroupForm: handleRequest(getEditGroupForm),
        updateGroup: handleRequest(updateGroup),
        getLoginForm: getLoginForm,
        getSearchMovieForm: getSearchMovieForm,
        getSignUpForm: getSignUpForm,
        getNewGroupForm: getNewGroupForm,
        deleteGroup: handleRequest(deleteGroup),
        addMovieToGroup: handleRequest(addMovieToGroup),
        removeMovieFromGroup: handleRequest(removeMovieFromGroup)
    }

    async function getGroups(req, rsp) {
        const groups = await servicesGroups.getGroups(req.token, req.query.q, req.query.skip, req.query.limit)
        // debug (`getGroups: ${tasks}`)
        debug(`getGroups: %O`, groups)

        return new View('groups', {title: 'All groups', groups: groups})
    }

    async function getGroup(req, rsp) {
        const groupId = req.params.id
        const group = await servicesGroups.getGroup(req.token, groupId)
        return new View('group', group)
    }

    function getNewGroupForm(req, rsp) {
        rsp.render('newGroup')
    }

    function getLoginForm(req, rsp) {
        rsp.render('login')
    }

    function getSignUpForm(req, rsp) {
        rsp.render('signup')
    }

    function getSearchMovieForm(req, rsp) {
        rsp.render('searchMovie')
    }

    async function getEditGroupForm(req, rsp) {
        const group = await servicesGroups.getGroup(req.token, req.params.id)
        debug(`getEditGroupForm: %O`, group)
        return new View('editGroup', group)
    }

    async function deleteGroup(req, rsp) {
        const groupId = req.body.groupId
        const group = await servicesGroups.deleteGroup(req.token, groupId)
        rsp.redirect('/groups')
    }

    async function addMovieToGroup(req, rsp) {
        const groupId = req.body.groupId
        const movieId = req.body.movieId
        const group = await servicesGroups.addMovieToGroup(req.token, groupId, movieId)
        rsp.redirect(`/groups/${groupId}`)
    }

    async function removeMovieFromGroup(req, rsp) {
        const groupId = req.body.groupId
        const movieId = req.body.movieId
        const group = await servicesGroups.removeMovieFromGroup(req.token, groupId, movieId)
        rsp.redirect(`/groups/${groupId}`)
    }

    async function updateGroup(req, rsp) {
        const groupId = req.body.groupId
        const group = await servicesGroups.updateGroup(req.token, groupId, req.body.name, req.body.description)
        rsp.redirect(`/groups/${groupId}`)
    }

    async function createGroup(req, rsp) {
        try {
            debug(`Creating group '${req.body.name}' with description '${req.body.description}'`)
            let group = await servicesGroups.createGroup(req.token, req.body.name, req.body.description)
            rsp.redirect(`/groups/`)
        } catch (e) {
            console.log(e)
            if (e.code === 1) {
                return new View('newGroup', req.body)
            }
            throw e
        }
    }

    async function getTopMovies(req, rsp) {
        const movieRequest = {
            offset: req.query.offset || 0, // TODO: Do this somewhere else
            limit: req.query.limit || 250, // TODO: Do this somewhere else
        }
        const movies = await servicesMovies.getTopMovies(movieRequest)
        // debug(`getTopMovies: %O`, movies)
        return new View('topMovies', {
            title: 'Top Movies', movies: movies.map(m => {
                return ({
                    id: m.id,
                    title: m.title,
                    rank: m.rank,
                    year: m.year,
                    imdbRating: m.imdbRating,
                    image: m.imageUrl,
                })
            }),
        })
    }

    async function getMovie(req, rsp) {
        const movieId = req.params.id
        const movie = await servicesMovies.getMovie(movieId)
        return new View('movie', movie)
    }

    async function getMovies(req, rsp) {
        const movieRequest = {
            offset: req.query.offset || 0, // TODO: Do this somewhere else
            limit: req.query.limit || 250, // TODO: Do this somewhere else
            search: req.query.search,
        }
        const movies = await servicesMovies.getMovies(movieRequest)
        // debug (`getMovies: ${tasks}`)
        debug(`getMovies: %O`, movies)
        return new View('searchResults', movies)
        }

    function handleRequest(handler) {
        return async function (req, rsp) {
            req.token = '7d458b7b-dccb-4eaf-9d53-29d45cbf3f32'
            try {
                let view = await handler(req, rsp)
                if (view) {
                    // debug(`Rendering view ${view.name} with data %O`, view.data)
                    rsp.render(view.name, view.data)
                }
            } catch (e) {
                const response = getHTTPError(e, "Internal Server Error")
                rsp.status(response.status)
                rsp.render('error', response)
                debug(`Error: %O`, e)
            }
        }
    }
}
