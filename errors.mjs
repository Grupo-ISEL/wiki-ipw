const errors = [{
    code: 1, message: 'Invalid token'
}, {
    code: 2, message: 'Group not found'
}, {
    code: 3, message: 'Access Denied'
}, {
    code: 4, message: 'Not Found',
}, {
    code: 5, message: 'Internal Server Error'
}, {
}]


export default function (code, message = null) {
    this.code = code
    this.message = message || errors[code].message
}
