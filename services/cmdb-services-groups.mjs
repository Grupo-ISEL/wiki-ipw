// Module contains all management logic
import cmdbData from "../data/cmdb-data-mem.mjs";
import error from "../errors.mjs";


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
        throw error.UNKNOWN()
    }
}

async function getGroupInternal(groupId, userId) {
        console.log(`Services: Getting group ${groupId} for user: ${userId}`)
        groupId = Number(groupId)
        if (isNaN(groupId))
            throw error.INVALID_PARAMETER('groupId must be a number')
        console.log(`Services: Getting group with id: ${groupId}`)
        const group = await cmdbData.getGroup(groupId)
        if (!group)
            throw error.GROUP_NOT_FOUND(groupId)

        if (group.userId !== userId)
            throw error.GROUP_ACCESS_DENIED(groupId)

        return group
}

function handleTokenValidation(action)  {
    return async function (token, groupId=null,  movieId=null) {
        const userId = await validateToken(token)
        if (userId) {
            console.log(`Running action: groupId: ${groupId} userId: ${userId} movieId: ${movieId}`)
            return action(groupId,userId,movieId)
        }
        throw error.GROUP_ACCESS_DENIED(groupId)
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

const servicesGroups = {
    getGroups,
    getGroup,
    createGroup,
    deleteGroup,
    updateGroup,
    addMovieToGroup,
    removeMovieFromGroup,
}

export default servicesGroups
