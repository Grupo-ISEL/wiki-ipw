import crypto from 'node:crypto'
import debugInit from 'debug'
import error from '../errors.mjs'
import fetch from 'node-fetch'


export default function (elasticUrl, elasticApiKey) {

    if (!elasticUrl)
        throw new Error('elasticUrl is mandatory')
    if (!elasticApiKey)
        throw new Error('elasticApiKey is mandatory')

    const debug = debugInit('cmdb:data:elastic')
    const ELASTIC_URL = elasticUrl
    const DEFAULT_HEADERS = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ApiKey ' + elasticApiKey,
            'Accept': 'application/json',
        },
    }

    return {
        getGroups,
        getGroup,
        createGroup,
        deleteGroup,
        updateGroup,
        addMovieToGroup,
        removeMovieFromGroup,
        createUser,
        getUserByToken,
    }

    // Return all groups
    async function getGroups(user) {
        debug(`getGroups for user: %O`, user)
        const userGroups = user['groups']
        if (!userGroups.length)
            return []
        const groups = await multiGetDocument('groups', userGroups)
        debug(`userGroups: %O`, userGroups)
        return groups
    }

    // Get a group by id
    async function getGroup(groupId) {
        debug(`getGroup with groupId: '${groupId}'`)
        const group = await getDocument("groups", groupId)
        debug(`Found group: %O`, group)
        return group
    }

    // Create a new group
    async function createGroup(user, name, description) {
        debug(`Creating group name '${name}' description '${description}'`)
        const groupId = await getNextId("groups")
        const group = {
            id: groupId,
            name,
            description,
            movies: [],
            totalDuration: 0,
        }
        const resp = await putDocument('groups', groupId, group)
        debug(`Created group in elastic: %O`, resp)
        if (resp.result !== 'created')
            throw error.UNKNOWN(`Group '${name}' not created`)

        debug(`Created group: '${resp['_id']}' - '${group.name}'`)

        async function addGroupToUser(userId, id) {
            debug(`Adding group '${id}' to user '${userId}'`)
            const user = await updateDocument('users', userId, {
                script: {
                    source: "if (!ctx._source.groups.contains(params.groups)) {ctx._source.groups.add(params.groups)}",
                    lang: "painless",
                    params: {groups: id},
                },
            })
        }

        const updateUser = await addGroupToUser(user.id, groupId)
        // TODO: add group id from elastic response in users group list
        return group
    }

    // Delete a group
    async function deleteGroup(user, groupId) {
        debug(`Deleting group '${groupId}'`)
        const rsp = await deleteDocument('groups', groupId)
        if (!rsp)
            throw error.GROUP_NOT_FOUND(groupId)
        debug(`Deleted group: %O`, rsp)

        async function removeGroupFromUser(userId, id) {
            debug(`Removing group '${id}' from user '${userId}'`)
            const user = await updateDocument('users', userId, {
                script: {
                    source: "if (ctx._source.groups.contains(params.groups)) {ctx._source.groups.remove(ctx._source.groups.indexOf(params.groups))}",
                    lang: "painless",
                    params: {groups: id},
                },
            })
        }

        const updateUser = await removeGroupFromUser(user.id, groupId)
    }

    // Update a group name and description
    async function updateGroup(group, name, description) {
        debug(`Updating group '${group.id}'`)
        const rsp = await updateDocument('groups', group.id, {doc: {name, description}})
        return rsp['get']['_source']
    }

    // Add a movie to a group
    // TODO: IMPLEMENT
    async function addMovieToGroup(groupId, movie) {
        debug(`Adding Movie '${movie.id}' to group '${groupId}' with duration '${movie.duration}'`)
        const group = await getGroup(groupId)
        if (group) {
            group.movies.push(movie.id)
            group.totalDuration += movie.duration
        }
        return group
    }

    // Remove a movie from a group
    // TODO: IMPLEMENT
    async function removeMovieFromGroup(groupId, movie) {
        debug(`Removing movie '${movie.id}' from group '${groupId}'`)
        const group = await getGroup(groupId)
        if (group) {
            const movie = group.movies.find(movie => movie === movie.id)
            if (!movie) {
                throw error.MOVIE_NOT_FOUND(`Movie '${movie.id}' not found in group '${groupId}'`)
            }
            group.movies = group.movies.filter(movie => movie !== movie.id)
            group.totalDuration -= movie.duration
        }
        return group
    }

    // Create a new user in ElasticSearch DB
    async function createUser() {
        const user = {id: await getNextId('users'), token: crypto.randomUUID(), groups: []}

        const resp = await putDocument('users', user.id, user)
        debug(`Created user in elastic: %O`, resp)
        debug(`Created user: '${user.id}' - '${user.token}'`)
        return user
    }

    // Get user by token from ElasticSearch DB
    async function getUserByToken(token) {
        debug(`getUserByToken with token: '${token}'`)
        const q = {query: {match: {token: token}}}
        const rsp = await searchDocument('users', q)
        debug(`search Rsp: %O`, rsp)
        if (rsp['total']['value'] === 1) {
            const user = rsp['hits'][0]['_source']
            debug(`Found user in elastic: %O`, user)
            return user
        }
    }

    // Get next id for a document type, create the nextId document if it doesn't exist
    async function getNextId(index) {
        const upd = {script: {source: "ctx._source.id++", lang: "painless"}, upsert: {id: 1}}
        const nextId = await updateDocument(index, 'nextId', upd)
        return nextId['get']['_source']['id']
    }

    // Upload document with PUT to ElasticSearch index
    async function putDocument(index, id, document) {
        debug(`putDocument with index: '${index}' id: '${id}' document: %O`, document)
        const data = await fetchFromES(`${index}/_doc/${id}`, 'PUT', document)
        // debug(`putDocument response: %O`, data)
        return data
    }

    // Upload document with POST to ElasticSearch index
    async function postDocument(index, document) {
        debug(`postDocument on index: '${index}' document: %O`, document)
        const data = await fetchFromES(`${ELASTIC_URL}/${index}/_doc`, 'POST', document)
        debug(`postDocument response: %O`, data)
        return data
    }

    //Update document with POST to ElasticSearch index
    async function updateDocument(index, id, document) {
        debug(`updateDocument on index: '${index}' id: '${id}' document: %O`, document)
        const data = await fetchFromES(`${index}/_update/${id}?_source`, 'POST', document)
        debug(`updatedocument response: %O`, data)
        return data
    }

    // Download document with GET to ElasticSearch index
    async function getDocument(index, id) {
        debug(`getDocument on index: '${index}' id: '${id}'`)
        const data = await fetchFromES(`${index}/_doc/${id}`, 'GET')
        // if (response.status === 404)
        //     return undefined
        // debug(`getDocument response: %O`, data)
        return data['_source']
    }

    // Download multiple documents from one ElasticSearch index
    async function multiGetDocument(index, ids) {
        debug(`multiGetDocument on index: '${index}' ids: %O`, ids)
        const data = await fetchFromES(`${index}/_mget`, 'POST', {ids})
        // debug(`multiGetDocument response: %O`, data)
        return data['docs'].map(doc => doc['_source'])
    }


    // Search documents with POST and query in ElasticSearch
    async function searchDocument(index, query) {
        debug(`searchDocument on index: '${index}' query: %O`, query)
        const data = await fetchFromES(`${index}/_search?_source`, 'POST', query)
        // debug(`searchDocument response: %O`, data)
        return data['hits']
    }

    async function deleteDocument(index, id) {
        debug(`deleteDocument on index: '${index}' id: '${id}'`)
        const data = await fetchFromES(`${index}/_doc/${id}`, 'DELETE')
        if (data['result'] === 'deleted') {
            debug(`Document '${id}' deleted`)
            return true
        }
        if (data['result'] === 'not_found')
            debug(`Document '${id}' not found`)
        return false
    }

    // generic fetch from ElasticSearch that accepts a url_path, method and optionally a body
    async function fetchFromES(url_path, method, body) {
        const response = await fetch(`${ELASTIC_URL}/${url_path}`, {
            method: method, ...DEFAULT_HEADERS,
            ...(body) && {body: JSON.stringify(body)},
        })
        if (response.status !== 200 && response.status !== 201)
            throw new Error(`Error fetching from ElasticSearch '${url_path}' method ${method} body ${body} status code '${response.status}'`)
        return await response.json()
    }
}
