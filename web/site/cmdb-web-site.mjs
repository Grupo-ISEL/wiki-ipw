// Module that contains the functions that handle all HTTP Website requests.
// Handle HTTP request means:
//  - Obtain data from requests. Request data can be obtained from: URI(path, query, fragment), headers, body
//  - Invoke the corresponding operation on services
//  - Generate the response in HTML format


import debugInit from 'debug'

import siteGroupsInit from './cmdb-site-groups.mjs'
import siteMoviesInit from './cmdb-site-movies.mjs'
import siteUsersInit from './cmdb-site-users.mjs'


const debug = debugInit("cmdb:web:site")

function View(name, data) {
    this.name = name
    this.data = data
}

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
        }
    }
}
