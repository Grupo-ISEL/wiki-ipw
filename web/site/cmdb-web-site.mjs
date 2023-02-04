import debugInit from 'debug'

import siteGroupsInit from './cmdb-site-groups.mjs'
import siteMoviesInit from './cmdb-site-movies.mjs'
import siteUsersInit from './cmdb-site-users.mjs'


const debug = debugInit("cmdb:web:site")

export default function (servicesGroups, servicesMovies, servicesUsers) {
    // Validate argument
    if (!servicesGroups)
        throw new Error("servicesGroups is mandatory")
    if (!servicesMovies)
        throw new Error("servicesMovies is mandatory")
    if (!servicesUsers)
        throw new Error("servicesUsers is mandatory")

    return {
        groups: siteGroupsInit(servicesGroups, servicesMovies),
        movies: siteMoviesInit(servicesGroups, servicesMovies),
        users: siteUsersInit(servicesUsers),
        getHome: function (req, rsp) {
            rsp.redirect('/groups')
        },
        getNotFound: function (req, rsp) {
            rsp.status(404).render('notFound', {title: '404 - Page Not Found'})
        }
    }
}
