// Module that contains the functions that handle all HTTP APi requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response
import cmdbServices from "../services/cmdb-services.mjs"


// List all movies
export async function getMovies(req, rsp) {
    const movies = await cmdbServices.getMovies()

    if (movies) {
        rsp.status(200).json(movies)
    } else {
        rsp.status(500).json({error: `Error getting movies`})
    }

}


// Get Top Movies
export function getTopMovies(req, rsp) {
    throw new Error("Not implemented")
}


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
        console.log("Error getting group with id: " + groupId)
        rsp.status(403).json({error: `Access denied to group ${groupId}`})
    }
}

async function getGroupsInternal(req, rsp) {
    try {
        const groups = await cmdbServices.getGroups(req.token)
        //console.log ("API - Got groups: " + JSON.stringify(groups))
        rsp.json(groups)
    } catch(e) {
        console.log("Error getting groups with token: " + req.token)
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
        console.log("Error creating group: " + e.message)
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
        console.log("Error deleting group: " + e.message)
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

    }
}

function addMovieToGroupInternal(req, rsp) {
    throw new Error("Not implemented")
}

function removeMovieFromGroupInternal(req, rsp) {
    throw new Error("Not implemented")
}

// List Users
export function getUsers(req, rsp) {
    throw new Error("Not implemented")
}


// Create a new user
export async function createUser(req, rsp) {
    try {
        const newUser = await cmdbServices.createUser()
        console.log(`Creating user id ${newUser.id} - ${newUser.userName} with token ${newUser.token}`)
        rsp.status(201).json({
            status: `New user created`,
            userId: newUser.id,
            userName: newUser.userName,
            token: newUser.token
        })
    } catch (e) {
        rsp.status(400).json({error: `Error creating user: ${e} `})
    }
}

function handleRequest(handler) {
    return function (req, rsp) {
        let token = req.get("Authorization")
        console.log(`Validating token ${token}`)
        if (token === undefined) {
            rsp.status(401).json({error: `Missing token`})
        } else {
            if (token.startsWith("Bearer ")) {
                token = token.replace("Bearer ", "")
                if (token !== "") {
                    req.token = token
                    console.log(`Token ${token} is valid`)
                    handler(req, rsp)
                }
            } else {
                rsp.status(401).json({error: `Invalid token`})
            }
        }
    }
}
