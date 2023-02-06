// Module contains all management logic for users
import debugInit from 'debug';
import error from "../errors.mjs";

export default function (cmdbData) {
    const debug = debugInit("cmdb:services:users")

    if(!cmdbData)
        throw new Error("cmdbData is mandatory")

    return {
        createUser,
        signUp,
        validateCredentials
    }

    // Create a new user
    async function createUser(username, email, password) {
        // Check if user already exists
        if (await cmdbData.getUserByUsername(username)) {
            debug(`User already exists: '${username}'`)
            throw error.USERNAME_ALREADY_EXISTS(username)
        }

        debug(`Creating user username:'${username}' email:'${email}' password:'${password}'`)
        const user = await cmdbData.createUser(username, email, password)
        debug(`Created user: ${user.id} username:'${user.username}' password:'${user.password}' token:${user.token}`)
        if (!user)
            throw error.UNKNOWN('Error creating user')
        return user
    }

    async function signUp(username, email, password, passwordConfirm) {
        if (password !== passwordConfirm) {
            debug(`Passwords do not match: '${password}' != '${passwordConfirm}'`)
            throw error.PASSWORDS_NOT_MATCH()
        }

        return createUser(username, email, password)
    }

    // Verify if user credentials are valid
    async function validateCredentials(username, password) {
        const user = await cmdbData.getUserByUsername(username)
        if (!user || user.password !== password) {
           debug(`Error validating credentials username:'${username}' password:'${password}'`)
            return null
           // throw error.INVALID_CREDENTIALS()
        }
        return user
    }
}
