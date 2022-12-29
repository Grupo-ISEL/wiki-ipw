// Services Errors

export default {
    INVALID_PARAMETER: argName => {
        return {
            code: 1,
            message: `Invalid argument ${argName}`
        }
    },
    GROUP_NOT_FOUND: (groupId) => {
        return {
            code: 2,
            message: `Group with id ${groupId} not found`
        }
    },
    GROUPS_NOT_FOUND: () => {
        return {
            code: 3,
            message: `No groups found`
        }
    },
    USER_NOT_FOUND: (userId) => {
        return {
            code: 4,
            message: `User with id ${userId} not found`
        }
    },
    MOVIE_NOT_FOUND: (movieId) => {
        return {
            code: 5,
            message: `Movie with id ${movieId} not found`
        }
    },
    GROUP_ACCESS_DENIED: (groupId) => {
        return {
            code: 6,
            message: `Access denied to group with id ${groupId}`
        }
    },
    UNKNOWN: (message) => {
        return {
            code: 7,
            message: message || `Unknown error`
        }
    }
}
