import crypto from "node:crypto";
import debugInit from 'debug';

const debug = debugInit("cmdb:data:mem")

let groups = [
    {
        id: 1,
        name: "Action",
        description: "Action movies",
        movies: ["tt1", "tt2", "tt3", "tt4"],
        totalDuration: 671,
        userId: 1

    },
    {
        id: 2,
        name: "Drama",
        description: "Drama movies",
        movies: ["tt1", "tt2", "tt3"],
        totalDuration: 519,
        userId: 2
    },
    {
        id: 3,
        name: "Comedy",
        description: "Comedy movies",
        movies: ["tt1", "tt2"],
        totalDuration: 317,
        userId: 3
    },
    {
        id: 4,
        name: "Sci-Fi",
        description: "Sci-Fi movies",
        movies: ["tt1", "tt2", "tt3", "tt4"],
        totalDuration: 671,
        userId: 1
    },
    {
        id: 5,
        name: "Horror",
        description: "Horror movies",
        movies: ["tt1", "tt4"],
        totalDuration: 671,
        userId: 2
    }
]

let users = [
    {id: 1, name: "Andre", token: "abc"},
    {id: 2, name: "Monteiro", token: "zxc"},
]
let nextUserId = users.length + 1
let nextGroupId = groups.length + 1


const cmdbData = {
    getGroups,
    getGroup,
    createGroup,
    deleteGroup,
    updateGroup,
    addMovieToGroup,
    removeMovieFromGroup,
    createUser,
    getUsers,
    getUserByToken
}

export default cmdbData


async function getGroups() {
    return groups
}

async function getGroup(groupId) {
    debug(`getGroup with groupId: '${groupId}'`)
    const group = groups.find(group => group.id === groupId)
    debug(`Found group: %O`, group)
    return group
}

async function createGroup(userId, name, description) {
    debug(`Creating group with id '${nextGroupId}' name '${name}' description '${description}'`)
    const group = {
        id: nextGroupId++,
        name,
        description,
        movies: [],
        totalDuration: 0,
        userId
    }
    groups.push(group)
    return group
}

async function deleteGroup(groupId) {
    debug(`Deleting group '${groupId}'`)
    const group = getGroup(groupId)
    if (group)
        groups = groups.filter(group => group.id !== groupId)
    return group
}

async function updateGroup(groupId, name, description) {
    debug(`Updating group '${groupId}'`)
    const group = getGroup(groupId)
    if (group) {
        group.name = name
        group.description = description
    }
    return group
}

async function addMovieToGroup(groupId, movieId, duration) {
    debug(`Adding Movie '${movieId}' to group '${groupId}' with duration '${duration}'`)
    const group = getGroup(groupId)
    if (group) {
        group.movies.push(movieId)
        group.totalDuration += duration
    }
    return group
}

async function removeMovieFromGroup(groupId, movieId) {
    debug(`Removing movie '${movieId}' from group '${groupId}'`)
    const group = getGroup(groupId)
    if (group) {
        const movie = group.movies.find(movie => movie === movieId)
        group.movies = group.movies.filter(movie => movie !== movieId)
        group.totalDuration -= movie.duration
    }
    return group
}

async function createUser(userName) {
    debug(`Creating user with id '${nextUserId}' name '${userName}'`)
    userName = userName || "User " + nextUserId
    const user = {id: nextUserId++, name: userName, token: crypto.randomUUID()}
    debug(`Created user: '${user.id}' - '${user.name}' - '${user.token}'`)
    users.push(user)
    return user
}

async function getUserByToken(token) {
    debug(`getUserByToken with token: '${token}'`)
    return users.find(user => user.token === token)
}


async function getUsers() {
    return users
}
