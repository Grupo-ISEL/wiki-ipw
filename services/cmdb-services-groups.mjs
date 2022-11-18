// Module contains all management logic
import cmdbData from "../data/cmdb-data-mem.mjs";
import error from "../errors.mjs";
import debugInit from 'debug';

const debug = debugInit("cmdb:services:groups")

const getGroup = handleTokenValidation(getGroupInternal)
const getGroups = handleTokenValidation(getGroupsInternal)
const createGroup = handleTokenValidation(createGroupInternal)
const deleteGroup = handleTokenValidation(deleteGroupInternal)
const updateGroup = handleTokenValidation(updateGroupInternal)
const addMovieToGroup = handleTokenValidation(addMovieToGroupInternal)
const removeMovieFromGroup = handleTokenValidation(removeMovieFromGroupInternal)

async function getGroupsInternal(userId) {
    debug(`Getting groups for user: ${userId}`)
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
    groupId = Number(groupId)
    debug(`Getting group ${groupId} for user: ${userId}`)
    if (isNaN(groupId))
        throw error.INVALID_PARAMETER('groupId must be a number')
    const group = await cmdbData.getGroup(groupId)
    if (!group)
        throw error.GROUP_NOT_FOUND(groupId)

    if (group.userId !== userId)
        throw error.GROUP_ACCESS_DENIED(groupId)

    return group
}

function handleTokenValidation(action) {
    return async function (token, groupId = null, movieId = null) {
        debug(`Handling token validation for action: ${action.name}`)
        const user = cmdbData.getUserByToken(token)
        debug(`User: %O`, user)
        if (user.id) {
            debug(`Running action: ${action.name} group: ${groupId} userId: ${user.id} movie: ${movieId}`)
            return action(user.id, groupId, movieId)
        }
        throw error.GROUP_ACCESS_DENIED(groupId)
    }
}

function createGroupInternal(userId, body) {
    throw "Not implemented";
}

function deleteGroupInternal(userId, groupId) {
    throw "Not implemented";
}

function updateGroupInternal(userId, groupId, body) {
    throw "Not implemented";
}

function addMovieToGroupInternal(userId, groupId, movieId) {
    throw "Not implemented";
}

function removeMovieFromGroupInternal(userId, groupId, movieId) {
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
