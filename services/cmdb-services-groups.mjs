// Module contains all management logic
import error from "../errors.mjs";
import debugInit from 'debug';

export default function (cmdbData, moviesData) {
    // Validate arguments
    if (!cmdbData) {
        throw error.INVALID_PARAMETER('moviesData')
    }
    const debug = debugInit("cmdb:services:groups")

    return {
        getGroup: handleTokenValidation(getGroupInternal),
        getGroups: handleTokenValidation(getGroupsInternal),
        createGroup: handleTokenValidation(createGroupInternal) ,
        deleteGroup:handleTokenValidation(createGroupInternal),
        updateGroup: handleTokenValidation(updateGroupInternal),
        addMovieToGroup: handleTokenValidation(addMovieToGroupInternal),
        removeMovieFromGroup: handleTokenValidation(removeMovieFromGroupInternal),
    }

    function handleTokenValidation(action) {
        return async function (token, groupId, movieId, name, description) {
            debug(`Handling token validation for action: '${action.name}'`)
            const user = await cmdbData.getUserByToken(token)
            debug(`User: %O`, user)
            if (user) {
                debug(`Running action: '${action.name}' group: '${groupId}' userId: '${user.id}' movie: '${movieId}'`)
                return action(user.id, groupId, movieId, name, description)
            }
            throw error.GROUPS_NOT_FOUND()
        }
    }

    async function getGroupsInternal(userId) {
        debug(`Getting groups for user: '${userId}'`)
        const groups = await cmdbData.getGroups()
        if (groups) {
            const userGroups = groups.filter(group => group.userId === userId)
            if (!userGroups)
                throw error.GROUPS_NOT_FOUND()
            return userGroups
        }
        throw error.UNKNOWN()
    }

    async function getGroupInternal(userId, groupId) {
        debug(`Getting group '${groupId}' for user: '${userId}'`)
        groupId = Number(groupId)
        if (isNaN(groupId))
            throw error.INVALID_PARAMETER('groupId must be a number')
        const group = await cmdbData.getGroup(groupId)
        if (!group)
            throw error.GROUP_NOT_FOUND(groupId)

        if (group.userId !== userId)
            throw error.GROUP_ACCESS_DENIED(groupId)

        return group
    }

    async function createGroupInternal(userId, name, description) {
        debug(`Creating new group for user: '${userId}' with name: '${name}' description: '${description}'`)
        const group = await cmdbData.createGroup(userId, name, description)
        debug(`Created group: %O`, group)
        if (!group)
            throw error.UNKNOWN()
        return group
    }

    async function deleteGroupInternal(userId, groupId) {
        debug(`Deleting group '${groupId}' with user: '${userId}'`)
        const group = await getGroupInternal(userId, groupId)
        const deletedGroup = await cmdbData.deleteGroup(group.id)
        if (!deletedGroup)
            throw error.UNKNOWN()
        return deletedGroup
    }

    async function updateGroupInternal(userId, groupId, name, description) {
        debug(`Updating group '${groupId}' with user: '${userId}' name: '${name}' description: '${description}'`)
        const group = await getGroupInternal(userId, groupId)
        const updatedGroup = await cmdbData.updateGroup(group.id, name, description)
        if (!updatedGroup)
            throw error.UNKNOWN()
        return updatedGroup
    }

    async function addMovieToGroupInternal(userId, groupId, movieId) {
        debug(`Adding Movie '${movieId}' to group '${groupId}' with user: '${userId}'`)
        return await handleGroupMovieActions(userId, groupId, movieId, cmdbData.addMovieToGroup)
    }

    async function removeMovieFromGroupInternal(userId, groupId, movieId) {
        debug(`Removing Movie '${movieId}' from group '${groupId}' with user: '${userId}'`)
        return await handleGroupMovieActions(userId, groupId, movieId, cmdbData.removeMovieFromGroup)
    }

    async function handleGroupMovieActions(userId, groupId, movieId, action) {
        debug(`Handling movie action: '${action.name}' for group: '${groupId}' movie: '${movieId}'`)
        const group = await getGroupInternal(userId, groupId)
        const movie = await moviesData.getMovie(movieId)
        if (!movie)
            throw error.MOVIE_NOT_FOUND(movieId)
        const updatedGroup = await action(group.id, movie.id)
        if (!updatedGroup)
            throw error.UNKNOWN()
        return updatedGroup
    }
}
