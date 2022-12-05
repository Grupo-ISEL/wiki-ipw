import apiGroupsInit from './cmdb-api-groups.mjs';
import apiMoviesInit from './cmdb-api-movies.mjs';
import apiUsersInit from './cmdb-api-users.mjs';

export default function apiInit(servicesGroups, servicesMovies, servicesUsers) {
    if (!servicesGroups) {
        throw new Error("servicesGroups is mandatory")
    }
    if (!servicesMovies) {
        throw new Error("servicesMovies is mandatory")
    }
    if (!servicesUsers) {
        throw new Error("servicesUsers is mandatory")
    }
    return {
        groups: apiGroupsInit(servicesGroups),
        movies: apiMoviesInit(servicesMovies),
        users: apiUsersInit(servicesUsers),
    }
}
