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

async function getGroupsInternal(userId) {
    console.log(`Services: Getting groups for user: ${userId}`)
    const groups = await cmdbData.getGroups()
        if (groups) {
            const userGroups = groups.filter(group => group.userId === userId)
            if (!userGroups)
                throw error.GROUP_NOT_FOUND()
            return userGroups
        }
        throw error.UNKNOWN()
}

async function getGroupInternal(userId, groupId) {
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
    return async function (token, groupId=null, movieId=null) {
        console.log(`Services: Handling token validation for action: ${action.name}`)
        const user = cmdbData.getUserByToken(token)
        console.log(`UserId: ${user.id} - Username: ${user.name} UserToken: ${user.token}`)
        if (user.id) {
            console.log(`Running action: groupId: ${groupId} userId: ${user.id} movieId: ${movieId}`)
            return action(user.id, groupId, movieId)
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
