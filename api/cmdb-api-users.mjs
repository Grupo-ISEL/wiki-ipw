// List Users
import debugInit from 'debug';
import getHTTPError from "./http-errors.mjs";


export default function (servicesUsers) {

    const debug = debugInit("cmdb:api:users")

    return {
        //getUsers,
        createUser
    }

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
}
