// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response
import cmdbServices from "../services/cmdb-services-groups.mjs"
import getHTTPError from "./http-errors.mjs";
import debugInit from 'debug';

const debug= debugInit("cmdb:api:groups")

export let getGroup = handleRequest(getGroupInternal)
export let getGroups = handleRequest(getGroupsInternal)
export let createGroup = handleRequest(createGroupInternal)
export let deleteGroup = handleRequest(deleteGroupInternal)
export let updateGroup = handleRequest(updateGroupInternal)
export let addMovieToGroup = handleRequest(addMovieToGroupInternal)
export let removeMovieFromGroup = handleRequest(removeMovieFromGroupInternal)


async function getGroupInternal(req, rsp) {
    const groupId = req.params.id
    const group = await cmdbServices.getGroup(req.token, groupId)
    if (group !== undefined) {
        if (group !== null) {
            rsp.json(group)
        } else {
            rsp.status(404).json({error: `Group with id ${groupId} not found`})
        }
    } else {
        debug(`Error getting group with id ${groupId}`)
        rsp.status(403).json({error: `Access denied to group ${groupId}`})
    }
}

async function getGroupsInternal(req, rsp) {
        const groups = await cmdbServices.getGroups(req.token)
        debug(`Got groups %O`, groups)
        if (groups !== undefined) {
            rsp.json(groups)
        } else {
            debug(`Error getting groups with token ${req.token}`)
            rsp.status(401).json({error: `Access denied to groups`})
        }
}

// Create a new group
function createGroupInternal(req, rsp) {
    const groupData = req.body
    try {
        const group = cmdbServices.createGroup(req.token, groupData)
        rsp.status(201).json(group)
    }
    catch (e) {
        debug(`Error creating group: ${e.message}`)
        rsp.status(403).json({error: `Access denied to create group`})
    }
    throw new Error("Not implemented")
}

// Delete a group by id
function deleteGroupInternal(req, rsp) {
    const groupId = req.params.id
    try {
        const group = cmdbServices.deleteGroup(req.token, groupId)
        rsp.json({status: `Group deleted`, group})
    }
    catch (e) {
        debug(`Error deleting group: ${e.message}`)
        rsp.status(403).json({error: `Access denied to delete group`})
    }
}

function updateGroupInternal(req, rsp) {
    const groupId = req.params.id
    const groupData = req.body
    try {
        const group = cmdbServices.updateGroup(req.token, groupId, groupData)
    }
    catch (e) {
        debug(`Error updating group: ${e.message}`)
        rsp.status(403).json({error: `Access denied to update group`})
    }
}

function addMovieToGroupInternal(req, rsp) {
    throw new Error("Not implemented")
}

function removeMovieFromGroupInternal(req, rsp) {
    throw new Error("Not implemented")
}

function handleRequest(handler) {
    return function (req, rsp) {
        let token = req.get("Authorization")
        debug(`Handling request for ${req.path} with token ${token}`)
        if (token === undefined) {
            rsp.status(401).json({error: `Missing token`})
        } else {
            if (token.startsWith("Bearer ")) {
                token = token.replace("Bearer ", "")
                if (token !== "") {
                    req.token = token
                    debug(`Found Bearer token ${token}`)
                    try {
                        handler(req, rsp)
                    }
                    catch (e) {

                        const httpError = getHTTPError(e.error, e.message)
                        rsp.status(httpError.status).json({status: httpError.message})
                    }
                }
            } else {
                rsp.status(401).json({error: `Invalid token`})
            }
        }
    }
}

const apiGroups = {
    getGroup,
    getGroups,
    createGroup,
    deleteGroup,
    updateGroup,
    addMovieToGroup,
    removeMovieFromGroup
}

export default apiGroups
