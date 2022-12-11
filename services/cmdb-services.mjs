import servicesGroupsInit from './cmdb-services-groups.mjs';
import servicesMoviesInit from './cmdb-services-movies.mjs';
import servicesUsersInit from './cmdb-services-users.mjs';
import nodeFetch from 'node-fetch'

export default function servicesInit(cmdbData, moviesDataInit, fetchModule) {
    if (!cmdbData) {
        throw new Error("cmdbData is mandatory")
    }
    if (!moviesDataInit) {
        throw new Error("moviesData is mandatory")
    }
    const fetch = fetchModule || nodeFetch
    const moviesData = moviesDataInit(fetch)
    return {
        groups: servicesGroupsInit(cmdbData, moviesData),
        movies: servicesMoviesInit(moviesData),
        users: servicesUsersInit(cmdbData),
    }
}
