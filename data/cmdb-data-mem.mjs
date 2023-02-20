import crypto from "node:crypto"
import debugInit from 'debug'
import error from "../errors.mjs"


export default function () {
    const debug = debugInit("cmdb:data:mem")

    let groups = [
        {
            id: 1,
            name: "Action",
            description: "Action movies",
            movies: ["tt0111161", "tt1375666"],
            totalDuration: 671,
        },
        {
            id: 2,
            name: "Drama",
            description: "Drama movies",
            movies: ["tt0111161", "tt0068646", "tt0071562"],
            totalDuration: 519,
        },
        {
            id: 3,
            name: "Comedy",
            description: "Comedy movies",
            movies: ["tt1375666", "tt0468569"],
            totalDuration: 317,
        },
        {
            id: 4,
            name: "Sci-Fi",
            description: "Sci-Fi movies",
            movies: ["tt0071562", "tt0468569"],
            totalDuration: 671,
        },
        {
            id: 5,
            name: "Horror",
            description: "Horror movies",
            movies: ["tt0111161", "tt0468569"],
            totalDuration: 671,
        },
    ]

    let users = [
        {id: 1, username: "Andre", email: "andre@example.com", password: "123qwe", token: "3280fcf9-eb87-4d44-b05e-12be5c7ba6e1", groups: [1, 4]},
        {id: 2, username: "Monteiro", email: "monteiro@example.com", password: "123qwe", token: "3280fcf9-eb87-4d44-b05e-12be5c7ba6e2", groups: [2, 5, 3] },
    ]
    let nextUserId = users.length + 1
    let nextGroupId = groups.length + 1

    return {
        getGroups,
        getGroup,
        createGroup,
        deleteGroup,
        updateGroup,
        addMovieToGroup,
        removeMovieFromGroup,
        createUser,
        getUserByToken,
        getUserByUsername
    }

    // Return all groups that the user has access to
    async function getGroups(user) {
        return Promise.all(user.groups.map(async groupId => await getGroup(groupId)))
    }

    // Get a group by id
    async function getGroup(groupId) {
        debug(`getGroup with groupId: '${groupId}'`)
        const group = groups.find(group => group.id === groupId)
        debug(`Found group: %O`, group)
        return group
    }

    // Create a new group
    async function createGroup(user, name, description) {
        debug(`Creating group with id '${nextGroupId}' name '${name}' description '${description}'`)
        const group = {
            id: nextGroupId++,
            name,
            description,
            movies: [],
            totalDuration: 0,
        }
        groups.push(group)
        user.groups.push(group.id)
        return group
    }

    // Delete a group
    async function deleteGroup(user, groupId) {
        debug(`Deleting group '${groupId}'`)
        const group = await getGroup(groupId)
        if (group) {
            groups = groups.filter(group => group.id !== groupId)
            const userIdx = users.indexOf(user)
            const groupIdx = users[userIdx].groups.indexOf(groupId)
            users[userIdx].groups.splice(groupIdx, 1)
        }
        return group
    }

    // Update a group name and description
    async function updateGroup(group, name, description) {
        debug(`Updating group '${group.id}'`)
        if (group) {
            group.name = name
            group.description = description
        }
        return group
    }

    // Add a movie to a group
    async function addMovieToGroup(groupId, movie) {
        debug(`Adding Movie '${movie.id}' to group '${groupId}' with duration '${movie.runtimeMins}'`)
        const group = await getGroup(groupId)
        if (group) {
            group.movies.push(movie.id)
            group.totalDuration += movie.runtimeMins
        }
        return group
    }

    // Remove a movie from a group
    async function removeMovieFromGroup(groupId, movie) {
        debug(`Removing movie '${movie.id}' from group '${groupId}'`)
        const group = await getGroup(groupId)
        if (group) {
            const groupLength = group.movies.length
            group.movies = group.movies.filter(m => m !== movie.id)

            if (groupLength === group.movies.length)
                throw error.MOVIE_NOT_FOUND(`Movie '${movie.id}' not found in group '${groupId}'`)
            group.totalDuration -= movie.runtimeMins
        }
        return group
    }

    // Create a new user
    async function createUser(username, email, password) {
        debug(`Creating user with id '${nextUserId} and '${username}'`)
        const user = {id: nextUserId++, username, email, password, token: crypto.randomUUID(), groups: []}
        debug(`Created user: '${user.id}' - username: '${user.username}' '${user.token}'`)
        users.push(user)
        return user
    }

    // Get user by token
    async function getUserByToken(token) {
        debug(`getUserByToken with token: '${token}'`)
        return users.find(user => user.token === token)
    }
    // Get user by username
    async function getUserByUsername(username) {
        debug(`getUserByUsername with username: '${username}'`)
        return users.find(user => user.username === username)
    }
}
