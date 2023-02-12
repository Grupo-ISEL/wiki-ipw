import apiGroupsInit from './cmdb-api-groups.mjs';
import apiMoviesInit from './cmdb-api-movies.mjs';
import apiUsersInit from './cmdb-api-users.mjs';

export default function apiInit(services) {
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
        groups: apiGroupsInit(services.groups),
        movies: apiMoviesInit(services.movies),
        users: apiUsersInit(services.users),
    }
}
