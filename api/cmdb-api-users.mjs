// List Users
import servicesUsers from "../services/cmdb-services-users.mjs";
import debugInit from 'debug';
import getHTTPError from "./http-errors.mjs";

const debug = debugInit("cmdb:api:users")

function getUsers(req, rsp) {
    throw new Error("Not implemented")
}

// Create a new user
async function createUser(req, rsp) {
    try {
        const newUser = await servicesUsers.createUser(req.body.username)
        debug(`Created user: ${newUser.id} - ${newUser.name} - ${newUser.token}`)
        rsp.status(201).json({
            status: `New user created`,
            id: newUser.id,
            name: newUser.name,
            token: newUser.token
        })
    } catch (e) {
        const httpError = getHTTPError(e.code, e.message)
        rsp.status(httpError.status).json({error: httpError.message})
    }
}

const apiUsers = {
    getUsers,
    createUser
}

export default apiUsers
