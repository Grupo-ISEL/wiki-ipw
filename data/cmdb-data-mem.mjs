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
        movies: ["tt1",  "tt4"],
        totalDuration: 671,
        userId: 2
    }
]

let users = [
    {id: 1, name: "Andre", token : "abc"},
    {id: 2, name: "Monteiro", token : "zxc"},
]
let nextUserId = users.length + 1

async function getGroups() {
    return groups
}

async function getGroup(groupId) {
    debug(`getGroup with groupId: ${groupId}`)
    const group = groups.find(group => group.id === groupId)
    debug(`Found group: %O`, group)
    return group
}

function createUser(userName) {
    // TODO: Add username from request
    const user= { id: nextUserId, userName: "User-" + nextUserId++, token: crypto.randomUUID() }
    users.push(user)
    return Promise.resolve(user)
}

function getUserByToken(token) {
    const user = users.find(user => user.token === token)
    return user
}


async function getUsers() {
    return users
}

const cmdbData = {
    getGroups,
    getGroup,
    createUser,
    getUsers,
    getUserByToken
}

export default cmdbData
