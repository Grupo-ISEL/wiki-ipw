import servicesGroupsInit from './cmdb-services-groups.mjs';
import servicesMoviesInit from './cmdb-services-movies.mjs';
import servicesUsersInit from './cmdb-services-users.mjs';

export default function servicesInit(cmdbData, moviesData) {

    return {
        groups: servicesGroupsInit(cmdbData, moviesData),
        movies: servicesMoviesInit(moviesData),
        users: servicesUsersInit(cmdbData),
    }
}
