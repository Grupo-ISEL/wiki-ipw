// List Users
import servicesUsers from "../services/cmdb-services-users.mjs";

function getUsers(req, rsp) {
    throw new Error("Not implemented")
}

// Create a new user
async function createUser(req, rsp) {
    try {
        const newUser = await servicesUsers.createUser()
        console.log(`Creating user id ${newUser.id} - ${newUser.userName} with token ${newUser.token}`)
        rsp.status(201).json({
            status: `New user created`,
            userId: newUser.id,
            userName: newUser.userName,
            token: newUser.token
        })
    } catch (e) {
        rsp.status(400).json({error: `Error creating user: ${e} `})
    }
}

const apiUsers = {
    getUsers,
    createUser
}

export default apiUsers
