// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response
import cmdbServices from "../services/cmdb-services-groups.mjs"
import getHTTPError from "./http-errors.mjs";
import debugInit from 'debug';

const debug = debugInit("cmdb:api:groups")

export let getGroup = handleRequest(getGroupInternal)
export let getGroups = handleRequest(getGroupsInternal)
export let createGroup = handleRequest(createGroupInternal)
export let deleteGroup = handleRequest(deleteGroupInternal)
export let updateGroup = handleRequest(updateGroupInternal)
export let addMovieToGroup = handleRequest(addMovieToGroupInternal)
export let removeMovieFromGroup = handleRequest(removeMovieFromGroupInternal)

const apiGroups = {
    getGroup, getGroups, createGroup, deleteGroup, updateGroup, addMovieToGroup, removeMovieFromGroup
}

export default apiGroups

async function getGroupInternal(req, rsp) {
    const groupId = req.params.id
    return await cmdbServices.getGroup(req.token, groupId)
}

async function getGroupsInternal(req, rsp) {
    const groups = await cmdbServices.getGroups(req.token)
    debug(`Got groups %O`, groups)
    return groups
}

// Create a new group
async function createGroupInternal(req, rsp) {
    const groupName = req.body.name
    const groupDesc = req.body.description
    debug(`Creating group with name '${groupName}' and description '${groupDesc}'`)
    const group = await cmdbServices.createGroup(req.token, groupName, groupDesc)
    rsp.status(201)
    return {status: "Group created", group}
}

// Delete a group by id
async function deleteGroupInternal(req, rsp) {
    const groupId = req.params.id
    const group = await cmdbServices.deleteGroup(req.token, groupId)
    return {status: `Group deleted`, group}
}

async function updateGroupInternal(req, rsp) {
    const groupId = req.params.id
    const groupName = req.body.name
    const groupDesc = req.body.description
    const group = await cmdbServices.updateGroup(req.token, groupId, groupName, groupDesc)
    return {status: "Group updated", group}
}

async function addMovieToGroupInternal(req, rsp) {
    const groupId = req.params.id
    const movieId = req.params.movieId
    const group = await cmdbServices.addMovieToGroup(req.token, groupId, movieId)
    return {status: "Movie added to group", group}
}

async function removeMovieFromGroupInternal(req, rsp) {
    const groupId = req.params.id
    const movieId = req.params.movieId
    const group = await cmdbServices.removeMovieFromGroup(req.token, groupId, movieId)
    return {status: "Movie removed from group", group}
}

function handleRequest(handler) {
    return async function (req, rsp) {
        let token = req.get("Authorization")
        debug(`Handling request for '${req.path}' with token '${token}'`)
        if (token === undefined) {
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
                        const httpError = getHTTPError(e.error, e.message)
                        rsp.status(httpError.status).json({error: httpError.message})
                    }
                }
            } else {
                rsp.status(401).json({error: `Invalid token`})
            }
        }
    }
}
