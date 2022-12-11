import debugInit from 'debug';
import error from "../errors.mjs";

export default function (cmdbData) {
    const debug = debugInit("cmdb:services:users")

    if(!cmdbData) {
        throw new Error("cmdbData is mandatory")
    }
    return {
        createUser
    }

    // Create a new user
    async function createUser() {
        const user = await cmdbData.createUser()
        debug(`Created user: ${user.id} - ${user.token}`)
        if (!user) {
            throw error.UNKNOWN('Error creating user')
        }
        return user
    }
}
