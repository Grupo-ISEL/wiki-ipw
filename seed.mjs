import {readFile} from "node:fs/promises"
import moviesDataInit from "./data/imdb-movies-data.mjs"
import mockFetch from "./data/imdb-mock-data.mjs"
import cmdbDataElastic from "./data/cmdb-data-elastic.mjs"
import {MAX_LIMIT} from "./services/cmdb-services-constants.mjs"
import servicesGroupsInit from "./services/cmdb-services-groups.mjs"
import servicesUsersInit from "./services/cmdb-services-users.mjs"
import fetch from "node-fetch"

const filename = process.argv[2]
const elasticUrl = process.argv[3]

if (!filename || !elasticUrl) {
    console.error("Usage: node seed.mjs <filename> <elasticUrl>")
    console.error("Example: node seed.mjs seed.json http://localhost:9200")
    process.exit(1)
}

const cmdbData = cmdbDataElastic(elasticUrl)
const moviesData = moviesDataInit(fetch, 'k_0v6pmbzj', MAX_LIMIT)
// const moviesData = moviesDataInit(mockFetch, "k_1234abcd", MAX_LIMIT)
const servicesGroups = servicesGroupsInit(cmdbData, moviesData)
const servicesUsers = servicesUsersInit(cmdbData)

async function seed() {
    try {
        const data = await readFile(filename)
        const json = JSON.parse(data)

        for (const userObj of json.users) {
            const user = await servicesUsers.createUser(userObj.username, userObj.email, userObj.password)
            console.log(`Created user: ${user.id} token: ${user.token}`)

            for (const groupObj of userObj.groups) {
                const group = await servicesGroups.createGroup(user.token, groupObj.name, groupObj.description)
                console.log(`Created group: ${group.id} for user: ${user.id}`)

                for (const movieId of groupObj.movies) {
                    await servicesGroups.addMovieToGroup(user.token, group.id, movieId)
                    console.log(`Added movie ${movieId} to group ${group.id}`)
                }
            }
        }
    } catch (e) {
        console.error(`Error reading file ${filename}: ${e.message}`)
    }
}

await seed()
