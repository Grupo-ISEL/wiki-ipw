import crypto from "node:crypto";

let groups = [
    {
        id: "g1",
        name: "Action",
        description: "Action movies",
        movies: ["tt1", "tt2", "tt3", "tt4"],
        totalDuration: 671,
        userId: 1

    },
    {
        id: "g2",
        name: "Drama",
        description: "Drama movies",
        movies: ["tt1", "tt2", "tt3"],
        totalDuration: 519,
        userId: 2
    },
    {
        id: "g3",
        name: "Comedy",
        description: "Comedy movies",
        movies: ["tt1", "tt2"],
        totalDuration: 317,
        userId: 3
    }
]

let users = [
    {id: 1, userName: "Andre", token : "abc"},
    {id: 2, userName: "Monteiro", token : "zxc"},
]
let nextUserId = 3


function getGroups() {
    return groups.length > 0 ? Promise.resolve(groups) : Promise.reject("No groups")
}

function getGroup(groupId) {
    const group = groups.find(group => group.id === groupId)
    return group ? Promise.resolve(group): Promise.reject("Group not found")
}

function createUser(userName) {
    const user= { id: nextUserId, userName: "User-" + nextUserId++, token: crypto.randomUUID() }
    users.push(user)
    return Promise.resolve(user)
}

function getUserByToken(token) {
    const user = users.find(user => user.token === token)
    return user ? Promise.resolve(user): Promise.reject("User not found")
}


function getUsers() {
    return Promise.resolve(users)
}

const cmdbData = {
    getGroups,
    getGroup,
    createUser,
    getUsers,
    getUserByToken
}

export default cmdbData
