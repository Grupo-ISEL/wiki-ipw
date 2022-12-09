// List Users
import debugInit from 'debug';
import getHTTPError from "../http-errors.mjs";


export default function (servicesUsers) {

    if (!servicesUsers) {
        throw new Error("servicesUsers is mandatory")
    }

    const debug = debugInit("cmdb:web:api:users")

    return {
        createUser
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
