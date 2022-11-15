import cmdbData from "../data/cmdb-data-mem.mjs";

export async function createUser() {
    const user = await cmdbData.createUser()
    console.log("Services - Created user with token: " + user.token)
    if (!user) {
        throw "Error creating user"
    }
    return user
}

const servicesUsers = {
    createUser
}

export default servicesUsers
