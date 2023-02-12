import siteGroupsInit from './cmdb-site-groups.mjs'
import siteMoviesInit from './cmdb-site-movies.mjs'
import siteUsersInit from './cmdb-site-users.mjs'

export default function (services) {
    // Validate argument
    if (!services.groups) {
        throw new Error("services.groups is mandatory")
    }
    if (!services.movies) {
        throw new Error("service.movies is mandatory")
    }
    if (!services.users) {
        throw new Error("servicesUsers is mandatory")
    }

    return {
        groups: siteGroupsInit(services.groups, services.movies),
        movies: siteMoviesInit(services.movies, services.movies),
        users: siteUsersInit(services.users),
        getHome: function (req, rsp) {
            rsp.redirect('/groups')
        },
        getNotFound: function (req, rsp) {
            rsp.status(404).render('notFound', {title: '404 - Page Not Found'})
        }
    }
}
