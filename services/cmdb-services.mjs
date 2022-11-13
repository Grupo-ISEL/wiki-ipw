// Module contains all management logic

import cmdbMoviesData from "../data/cmdb-movies-data.mjs";
import cmdbData from "../data/cmdb-data-mem.mjs";
import error from "../errors.mjs";

async function createUser() {
    const user = await cmdbData.createUser()
    console.log("Services - Created user with token: " + user.token)
    if (!user) {
        throw "Error creating user"
    }
    return user
}


const getGroup = handleTokenValidation(getGroupInternal)
const getGroups = handleTokenValidation(getGroupsInternal)
const createGroup = handleTokenValidation(createGroupInternal)
const deleteGroup = handleTokenValidation(deleteGroupInternal)
const updateGroup = handleTokenValidation(updateGroupInternal)
const addMovieToGroup = handleTokenValidation(addMovieToGroupInternal)
const removeMovieFromGroup = handleTokenValidation(removeMovieFromGroupInternal)



async function validateToken(token) {
    console.log(`Validating token: ${token}`)

    const user = await cmdbData.getUserByToken(token)
    console.log(`UserId: ${user.id} - UserToken: ${user.token}`)
    return user.id
}


async function getGroupsInternal() {
    try {
        const groups = await cmdbData.getGroups()
        //console.log("Services - Got groups: " + JSON.stringify(groups))
        return groups
    }
    catch {
        throw new error(5, "Internal Server Error")
    }
}

async function getGroupInternal(groupId, userId) {
        //if (!isNaN(groupId))
        //    throw new error(4, "Group id must be a number")
        const group = await cmdbData.getGroup(groupId)
        if (!group)
            throw new error(4, `Group with id ${groupId} not found`)

        if (group.userId !== userId)
            throw new error(3, `Access denied to group ${groupId}`)

        return group
}

function handleTokenValidation(action)  {
    return async function (token, groupId=null,  movieId=null) {
        const id = await validateToken(token)
        if (id) {
            console.log("Running action")
            return action(groupId,id,movieId)
        }
        throw new error(1, 'No user with the given token')
    }
}

function createGroupInternal(userId, body) {
    throw "Not implemented";
}

function deleteGroupInternal(groupId, userId) {
    throw "Not implemented";
}

function updateGroupInternal(groupId, userId) {
    throw "Not implemented";
}
function addMovieToGroupInternal(groupId, userId) {
    throw "Not implemented";
}
function removeMovieFromGroupInternal(groupId, userId) {
    throw "Not implemented";
}
function getTopMovies(maximum = 250) {
    throw "Not implemented";
}

async function getMovies(search_text, maximum = 250) {
    return cmdbMoviesData.getMovies();
}



const services = {
    createUser,
    getMovies,
    getGroups,
    getGroup,
    createGroup,
    deleteGroup,
    updateGroup,
    addMovieToGroup,
    removeMovieFromGroup,
    getTopMovies
}

export default services
