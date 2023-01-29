// Module that contains the functions that handle all HTTP Website requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format


import getHTTPError from "../http-errors.mjs"
import debugInit from 'debug'
import express from 'express'


const debug = debugInit("cmdb:site:groups")

function View(name, data) {
    this.name = name
    this.data = data
}

export default function (servicesGroups, servicesMovies) {

    if (!servicesGroups)
        throw new Error("servicesGroups is mandatory")
    if (!servicesMovies)
        throw new Error("servicesMovies is mandatory")

    const router = express.Router()

    router.get('/new', getNewGroupForm)
    router.get('/:id/edit', handleRequest(getEditGroupForm))
    router.get('/:id', handleRequest(getGroup))
    router.get('/', handleRequest(getGroups))
    router.post('/', handleRequest(createGroup))
    router.post('/edit', handleRequest(updateGroup))
    router.post('/delete', handleRequest(deleteGroup))
    router.post('/addMovie', handleRequest(addMovieToGroup))
    router.post('/removeMovie', handleRequest(removeMovieFromGroup))
    // router.put('/:id', handleRequest(updateGroup))
    // router.delete('/:id', handleRequest(deleteGroup))
    // router.put('/:id/movies/:movieId', handleRequest(addMovieToGroup))
    // router.delete('/:id/movies/:movieId', handleRequest(removeMovieFromGroup))

    return router

    function getNewGroupForm(req, rsp) {
        rsp.render('newGroup', {title: 'New group'})
    }


    async function getUpdatedGroup(req) {
        let group = await servicesGroups.getGroup(req.user.token, req.params.id)
        group = await updateGroupMovies(group, req.session.movies)
        req.session.groups = req.session.groups.map(sessionGroup => sessionGroup.id === group.id ? group : sessionGroup);
        return group
    }

    async function updateGroupMovies(group, moviesSession) {
        // Only fetch movies that are not already in the session property movies
        const moviesToFetch = group.movies.filter(movieId => !moviesSession[movieId]);
        // Add movies to session property movies
        for (let movie of moviesToFetch) {
            moviesSession[movie] = await servicesMovies.getMovie(movie);
        }
        // Update the group with the movie details
        group.movies = group.movies.map(movieId => moviesSession[movieId]);
        return group;
    }

    async function getGroups(req, rsp) {
        const groups = await servicesGroups.getGroups(req.user.token)

        req.session.groups = await Promise.all(groups.map(group => updateGroupMovies(group, req.session.movies)))
        return new View('groups', {title: 'All groups', token: req.user.token, groups: req.session.groups})
    }

    async function getGroup(req, rsp) {
        const group = await getUpdatedGroup(req)
        debug(`getGroup: req.session.groups: %O`, req.session.groups)

        return new View('group', {title: 'Group', token: req.user.token, group: group, movies: group.movies})
    }

    async function getEditGroupForm(req, rsp) {
        const group = await getUpdatedGroup(req)
        debug(`getEditGroupForm: %O`, group)
        return new View('editGroup', {token: req.user.token, group: group, movies: group.movies})
    }

    async function deleteGroup(req, rsp) {
        const groupId = req.body.groupId
        const group = await servicesGroups.deleteGroup(req.user.token, groupId)
        rsp.redirect('/groups')
    }

    async function addMovieToGroup(req, rsp) {
        const groupId = req.body.groupId
        const movieId = req.body.movieId
        const group = await servicesGroups.addMovieToGroup(req.user.token, groupId, movieId)
        rsp.redirect(`/groups/${groupId}`)
    }

    async function removeMovieFromGroup(req, rsp) {
        const groupId = req.body.groupId
        const movieId = req.body.movieId
        const group = await servicesGroups.removeMovieFromGroup(req.user.token, groupId, movieId)
        rsp.redirect(`/groups/${groupId}`)
    }

    async function updateGroup(req, rsp) {
        const groupId = req.body.groupId
        const group = await servicesGroups.updateGroup(req.user.token, groupId, req.body.name, req.body.description)
        rsp.redirect(`/groups/${groupId}`)
    }

    async function createGroup(req, rsp) {
        try {
            debug(`Creating group '${req.body.name}' with description '${req.body.description}'`)
            let group = await servicesGroups.createGroup(req.user.token, req.body.name, req.body.description)
            rsp.redirect(`/groups/`)
        } catch (e) {
            console.log(e)
            if (e.code === 1) {
                return new View('newGroup', req.body)
            }
            throw e
        }
    }

    function handleRequest(handler) {
        return async function (req, rsp) {
            try {
                const view = await handler(req, rsp)
                if (view)
                    rsp.render(view.name, view.data)
            } catch (e) {
                const httpError = getHTTPError(e.code, e.message || e)
                debug(`Error: %O`, httpError)
                rsp.status(httpError.status)
                rsp.render('error', httpError)
                debug(`Error: %O`, e)
            }
        }
    }
}
