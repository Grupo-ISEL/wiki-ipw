// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response
import getHTTPError from "../http-errors.mjs";
import error  from "../../errors.mjs"
import debugInit from 'debug';
import express from 'express';

export default function (cmdbServices) {

    if (!cmdbServices)
        throw new Error("cmdbServices is mandatory")

    const debug = debugInit("cmdb:web:api:groups")

    const router = express.Router()

    router.route('/')
        .get(handleRequest(getGroups))
        .post(handleRequest(createGroup))
    router.route('/:id')
        .get(handleRequest(getGroup))
        .put(handleRequest(updateGroup))
        .delete(handleRequest(deleteGroup))
    router.route('/:id/movies/:movieId')
        .put(handleRequest(addMovieToGroup))
        .delete(handleRequest(removeMovieFromGroup))

    return router

    // Get a group
    async function getGroup(req, rsp) {
        return await cmdbServices.getGroup(req.token, req.params.id)
    }

    // Get all groups that belong to the requesting user
    async function getGroups(req, rsp) {
        const groups = await cmdbServices.getGroups(req.token)
        debug(`Got groups %O`, groups)
        return groups
    }

    // Create a new group
    async function createGroup(req, rsp) {
        debug(`Creating group with name '${req.body.name}' and description '${req.body.description}'`)
        if (!req.body.name)
            throw error.INVALID_PARAMETER('group name is mandatory')
        if (!req.body.description)
            throw error.INVALID_PARAMETER('group description is mandatory')
        const group = await cmdbServices.createGroup(req.token, req.body.name, req.body.description)
        rsp.status(201)
        return {status: "Group created", group}
    }

    // Delete a group
    async function deleteGroup(req, rsp) {
        const group = await cmdbServices.deleteGroup(req.token, req.params.id)
        return {status: `Group deleted`, group}
    }

    // Update a group
    async function updateGroup(req, rsp) {
        if (!req.body.name)
            throw error.INVALID_PARAMETER('group name is mandatory')
        if (!req.body.description)
            throw error.INVALID_PARAMETER('group description is mandatory')
        const group = await cmdbServices.updateGroup(req.token, req.params.id, req.body.name, req.body.description)
        return {status: "Group updated", group}
    }

    // Add a movie to a group
    async function addMovieToGroup(req, rsp) {
        if (!req.params.id)
            throw error.INVALID_PARAMETER('groupId is mandatory')
        if (!req.params.movieId)
            throw error.INVALID_PARAMETER('movieId is mandatory')
        const group = await cmdbServices.addMovieToGroup(req.token, req.params.id, req.params.movieId)
        return {status: "Movie added to group", group}
    }

    // Remove a movie from a group
    async function removeMovieFromGroup(req, rsp) {
       if (!req.params.id)
            throw error.INVALID_PARAMETER('groupId is mandatory')
        if (!req.params.movieId)
            throw error.INVALID_PARAMETER('movieId is mandatory')
        const group = await cmdbServices.removeMovieFromGroup(req.token, req.params.id, req.params.movieId)
        return {status: `Movie ${req.params.movieId} removed from group`, group}
    }

    // Handle HTTP request
    // Validates if the client supplied a Bearer token
    function handleRequest(handler) {
        return async function (req, rsp) {
            let token = req.get("Authorization")
            debug(`Handling request for '${req.path}' with token '${token}'`)
            if (!token) {
                rsp.status(401).json({error: `Missing token`})
            } else {
                if (token.startsWith("Bearer ")) {
                    token = token.replace("Bearer ", "")
                    if (token !== "") {
                        req.token = token
                        debug(`Found Bearer token '${token}'`)
                        try {
                            const resp = await handler(req, rsp)
                            debug(`Response: %O`, resp)
                            rsp.json(resp)
                        } catch (e) {
                            const httpError = getHTTPError(e.code, e.message)
                            rsp.status(httpError.status).json({error: httpError.message})
                        }
                    }
                } else {
                    rsp.status(401).json({error: `Invalid token`})
                }
            }
        }
    }
}
