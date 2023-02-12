// Module that contains the functions that handle all HTTP Website requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format

import getHTTPError from "../http-errors.mjs"
import debugInit from 'debug'
import express from 'express'
import passport from 'passport'
import expressSession from 'express-session'

export default function (services) {

    if (!services)
        throw new Error("servicesUsers is mandatory")

    const debug = debugInit("cmdb:site:users")
    const router = express.Router()

    router.use(expressSession(
        {
            secret: "d3cb156b-d7fc-4fbd-8dd2-c2a607ad04fa",
            resave: false,
            saveUninitialized: false,
        },
    ))

    // Passport initialization
    router.use(passport.session())
    router.use(passport.initialize())

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))

    router.use('/groups', verifyAuthenticated)
    router.route('/login')
        .get(loginForm)
        .post(login)
    router.route('/signup')
        .get(signUpForm)
        .post(signup)
    router.post('/logout', logout)

    return router

    function verifyAuthenticated(req, rsp, next) {
        debug(`Verifying if user is authenticated`)
        if (req.user) {
            debug(`User is authenticated`)
            return next()
        }
        rsp.redirect('/login')
    }

    function logout(req, rsp) {
        req.logout((err) => rsp.redirect('/'))
    }

    async function login(req, rsp) {
        debug(`Validating credentials for user ${req.body.username}`)
        const user = await services.validateCredentials(req.body.username, req.body.password)
        if (user)
            return req.login(user, (err) => {
                req.session.movies = {}
                req.session.groups = []
                rsp.redirect('/groups')
            })
        rsp.render('loginForm', {username: req.body.username, message: "Invalid credentials"})
    }

    function loginForm(req, rsp) {
        rsp.render('loginForm')
    }

    function signUpForm(req, rsp) {
        rsp.render('signupForm')
    }

    async function signup(req, rsp) {
        try {
            debug(`Creating user '${req.body.username}' email '${req.body.email}'  password '${req.body.password}' confirmation '${req.body.passwordConfirm}'`)
            const user = await services.signUp(req.body.username, req.body.email, req.body.password, req.body.passwordConfirm)
            debug(`User '${req.body.username}' created`)
            return login(req, rsp)
        } catch (e) {
            const error = getHTTPError(e.code, e.message)
            debug(`Error creating user '${req.body.username}' email '${req.body.email}' password '${req.body.password}' confirmation '${req.body.passwordConfirm}': ${error.status} - ${error.message}`)
            rsp.status(error.status)
            rsp.render('signupForm', {
                username: req.body.username,
                email: req.body.email,
                message: error.message,
            })
        }
    }

}
