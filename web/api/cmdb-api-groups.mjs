// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response
import getHTTPError from "../http-errors.mjs";
import debugInit from 'debug';

export default function (cmdbServices) {

    if (!cmdbServices) {
        throw new Error("cmdbServices is mandatory")
    }
    const debug = debugInit("cmdb:web:api:groups")

    const getGroup = handleRequest(getGroupInternal)
    const getGroups = handleRequest(getGroupsInternal)
    const createGroup = handleRequest(createGroupInternal)
    const deleteGroup = handleRequest(deleteGroupInternal)
    const updateGroup = handleRequest(updateGroupInternal)
    const addMovieToGroup = handleRequest(addMovieToGroupInternal)
    const removeMovieFromGroup = handleRequest(removeMovieFromGroupInternal)

   return {
        getGroup,
        getGroups,
        createGroup,
        deleteGroup,
        updateGroup,
        addMovieToGroup,
        removeMovieFromGroup
   }

    // Get a group
    async function getGroupInternal(req, rsp) {
        return await cmdbServices.getGroup(req.token, req.params.id)
    }

    // Get all groups that belong to the requesting user
    async function getGroupsInternal(req, rsp) {
        const groups = await cmdbServices.getGroups(req.token)
        debug(`Got groups %O`, groups)
        return groups
    }

    // Create a new group
    async function createGroupInternal(req, rsp) {
        debug(`Creating group with name '${req.body.name}' and description '${req.body.description}'`)
        const group = await cmdbServices.createGroup(req.token, req.body.name, req.body.description)
        rsp.status(201)
        return {status: "Group created", group}
    }

    // Delete a group
    async function deleteGroupInternal(req, rsp) {
        const group = await cmdbServices.deleteGroup(req.token, req.params.id)
        return {status: `Group deleted`, group}
    }

    // Update a group
    async function updateGroupInternal(req, rsp) {
        const group = await cmdbServices.updateGroup(req.token, req.params.id, req.body.name, req.body.description)
        return {status: "Group updated", group}
    }

    // Add a movie to a group
    async function addMovieToGroupInternal(req, rsp) {
        const group = await cmdbServices.addMovieToGroup(req.token, req.params.id, req.params.movieId)
        return {status: "Movie added to group", group}
    }

    // Remove a movie from a group
    async function removeMovieFromGroupInternal(req, rsp) {
        const group = await cmdbServices.removeMovieFromGroup(req.token, req.params.id, req.params.movieId)
        return {status: "Movie removed from group", group}
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
