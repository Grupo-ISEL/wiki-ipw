import cmdbData from "../data/cmdb-data-mem.mjs";
import debugInit from 'debug';

const debug = debugInit("cmdb:services:users")

export async function createUser(username) {
    const user = await cmdbData.createUser(username)
    debug(`Created user: ${user.id} - ${user.name} - ${user.token}`)
    if (!user) {
        throw "Error creating user"
    }
    return user
}

const servicesUsers = {
    createUser
}

export default servicesUsers
