import apiGroupsInit from './cmdb-api-groups.mjs';
import apiMoviesInit from './cmdb-api-movies.mjs';
import apiUsersInit from './cmdb-api-users.mjs';

export default function apiInit(servicesGroups, servicesMovies, servicesUsers) {
    return {
        groups: apiGroupsInit(servicesGroups),
        movies: apiMoviesInit(servicesMovies) ,
        users: apiUsersInit(servicesUsers),
    }
}
