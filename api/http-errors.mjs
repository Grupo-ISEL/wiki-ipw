const HTTP_ERRORS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
}
const HTTP_ERRORS_MAPPING = {
    1: HTTP_ERRORS.BAD_REQUEST,
    2: HTTP_ERRORS.NOT_FOUND,
    3: HTTP_ERRORS.NOT_FOUND,
    4: HTTP_ERRORS.NOT_FOUND,
    5: HTTP_ERRORS.FORBIDDEN,
    6: HTTP_ERRORS.INTERNAL_SERVER_ERROR
}

// Return an object with status code and message based on the error code
// TODO: Find a better way to do this??
function getHTTPError(errorCode, message) {
   return {
         status: HTTP_ERRORS_MAPPING[errorCode] || HTTP_ERRORS.INTERNAL_SERVER_ERROR,
         message: message || `Error ${errorCode}`
   }
}

export default getHTTPError
