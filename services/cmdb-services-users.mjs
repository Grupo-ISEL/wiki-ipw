import debugInit from 'debug';
import error from "../errors.mjs";

export default function (cmdbData) {
    const debug = debugInit("cmdb:services:users")

    if(!cmdbData) {
        throw error.INVALID_PARAMETER('cmdbData')
    }
    return {
        createUser
    }

    async function createUser(username) {
        const user = await cmdbData.createUser(username)
        debug(`Created user: ${user.id} - ${user.name} - ${user.token}`)
        if (!user) {
            throw "Error creating user"
        }
        return user
    }
}
