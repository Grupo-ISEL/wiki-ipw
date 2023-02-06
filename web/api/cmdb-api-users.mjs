// List Users
import debugInit from 'debug';
import getHTTPError from "../http-errors.mjs";
import express from 'express'

export default function (servicesUsers) {

    if (!servicesUsers)
        throw new Error("servicesUsers is mandatory")

    const debug = debugInit("cmdb:web:api:users")

    const router = express.Router()

    router.post('/', createUser)

    return router

    // Create a new user
    async function createUser(req, rsp) {
        try {
            const user = await servicesUsers.createUser(req.body.username, req.body.email, req.body.password)
            debug(`Created user: ${user.id} - ${user.username} - ${user.token}`)
            rsp.status(201).json({
                status: `New user created`,
                 id: user.id,
                 username: user.username,
                 email: user.email,
                 password: user.password,
                 token: user.token
            })
        } catch (e) {
            const httpError = getHTTPError(e.code, e.message)
            rsp.status(httpError.status).json({error: httpError.message})
        }
    }
}
