// Module contains all management logic for groups
import error from "../errors.mjs";
import debugInit from 'debug';

export default function (cmdbData, moviesData) {
    // Validate arguments
    if (!cmdbData) {
        throw new Error("cmdbData is mandatory")
    }
    if (!moviesData) {
        throw new Error("moviesData is mandatory")
    }
    const debug = debugInit("cmdb:services:groups")

    return {
        getGroup: handleTokenValidation(getGroup),
        getGroups: handleTokenValidation(getGroups),
        createGroup: handleTokenValidation(createGroup),
        deleteGroup: handleTokenValidation(deleteGroup),
        updateGroup: handleTokenValidation(updateGroup),
        addMovieToGroup: handleTokenValidation(addMovieToGroup),
        removeMovieFromGroup: handleTokenValidation(removeMovieFromGroup),
    }

    // Handle token validation. Calls the action if token is valid
    // TODO: Better error handling
    function handleTokenValidation(action) {
        return async function (token, groupId, movieId, name, description) {
            debug(`Handling token validation for action: '${action.name}'`)
            const user = await cmdbData.getUserByToken(token)
            debug(`User: %O`, user)
            if(!user)
                throw error.ACCESS_DENIED()
           debug(`Running action: '${action.name}' group: '${groupId}' userId: '${user.id}' movie: '${movieId}'`)
           return await action(user, groupId, movieId, name, description)
        }
    }

    // Return all groups
    async function getGroups(user) {
        debug(`Getting groups for user: '${user.id}'`)
        const groups = await cmdbData.getGroups(user)
        if (!groups)
            throw error.GROUPS_NOT_FOUND()
        return groups
    }

    // Get a group by id
    async function getGroup(user, groupId) {
        debug(`Getting group '${groupId}' for user: '${user.id}'`)
        groupId = Number(groupId)
        if (isNaN(groupId))
            throw error.INVALID_PARAMETER('groupId must be a number')
        if (!user.groups.find(g => g === groupId))
            throw error.GROUP_NOT_FOUND(groupId)
        const group = await cmdbData.getGroup(groupId)
        if (!group)
            throw error.GROUP_NOT_FOUND(groupId)
        return group
    }

    // Create a new group
    // TODO: Better validation
    async function createGroup(user, name, description) {
        debug(`Creating new group for user: '${user.id}' with name: '${name}' description: '${description}'`)
        const group = await cmdbData.createGroup(user, name, description)
        debug(`Created group: %O`, group)
        if (!group)
            throw error.UNKNOWN()
        return group
    }

    // Delete a group
    // TODO: Better error handling
    async function deleteGroup(user, groupId) {
        debug(`Deleting group '${groupId}' with user: '${user.id}'`)
        const group = await getGroup(user, groupId)
        const deletedGroup = await cmdbData.deleteGroup(user, group.id)
        // if (!deletedGroup)
        //     throw error.UNKNOWN()
        return group
    }

    async function updateGroup(user, groupId, name, description) {
        debug(`Updating group '${groupId}' with user: '${user.id}' name: '${name}' description: '${description}'`)
        const group = await getGroup(user, groupId)
        const updatedGroup = await cmdbData.updateGroup(group, name, description)
        if (!updatedGroup)
            throw error.UNKNOWN()
        return updatedGroup
    }

    // Add movie to group
    async function addMovieToGroup(user, groupId, movieId) {
        debug(`Adding Movie '${movieId}' to group '${groupId}' with user: '${user.id}'`)
        return await handleGroupMovieActions(user, groupId, movieId, cmdbData.addMovieToGroup)
    }

    // Remove movie from group
    async function removeMovieFromGroup(user, groupId, movieId) {
        debug(`Removing Movie '${movieId}' from group '${groupId}' with user: '${user.id}'`)
        return await handleGroupMovieActions(user, groupId, movieId, cmdbData.removeMovieFromGroup)
    }

    async function handleGroupMovieActions(user, groupId, movieId, action) {
        debug(`Handling movie action: '${action.name}' for group: '${groupId}' movie: '${movieId}'`)
        const group = await getGroup(user, groupId)
        const movie = await moviesData.getMovie(movieId)
        if (!movie)
            throw error.MOVIE_NOT_FOUND(movieId)
        const updatedGroup = await action(group.id, movie)
        if (!updatedGroup)
            throw error.UNKNOWN()
        return updatedGroup
    }
}
