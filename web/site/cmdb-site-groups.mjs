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

    return router

    function getNewGroupForm(req, rsp) {
        rsp.render('newGroup')
    }

    async function getEditGroupForm(req, rsp) {

        const group = await servicesGroups.getGroup(req.user.token, req.params.id)
        const movies = await Promise.all(group.movies.map(async id => await servicesMovies.getMovie(id)))
        debug(`getEditGroupForm: %O`, group)
        return new View('editGroup', {group, movies})
    }

    async function getGroups(req, rsp) {
        const groups = await servicesGroups.getGroups(req.user.token)
        // debug(`getGroups: %O`, groups)

        groups.forEach( g => { g.updated = g.updated || false})
        req.session.groups = groups
        debug (`getGroups: %O`, groups)
        return new View('groups', {title: 'All groups', groups: groups})
    }

    async function getGroup(req, rsp) {
        const group = await servicesGroups.getGroup(req.user.token, req.params.id)
        debug (`getGroup group: %O`, group)

        const idx= req.session.groups.findIndex(g => g.id === group.id)
        if (req.session.groups[idx]) {
            if (!req.session.groups[idx].updated) {
                debug(`Updating group ${group.id} movies`)
                req.session.groups[idx].updated = true
                req.session.groups[idx].movies = await Promise.all(group.movies.map(async id => await servicesMovies.getMovie(id)))
            } else {
                debug(`Group ${group.id} movies already updated`)
            }
            return new View('group', {group: req.session.groups[idx], movies: req.session.groups[idx].movies})
        }
        debug(`Group ${group.id} not found in session`)
        debug (`getGroup movies: %O`, group.movies)
        return new View('group', {group: group, movies: group.movies})
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
                if (view) {
                    // debug(`Rendering view ${view.name} with data %O`, view.data)
                    rsp.render(view.name, view.data)
                }
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
