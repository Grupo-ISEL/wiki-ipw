import crypto from 'node:crypto'
import debugInit from 'debug'
import error from '../errors.mjs'
import fetch from 'node-fetch'

export default function (elasticUrl) {

    if (!elasticUrl)
        throw new Error('elasticUrl is mandatory')

    const debug = debugInit('cmdb:data:elastic')
    const ELASTIC_URL = elasticUrl
    const DEFAULT_HEADERS = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    }

    init().then(() => debug('Elastic indexes creation complete')).catch(err => debug('Error creating indexes: %O', err))

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
        getUserByUsername
    }


    async function init() {
        // ElasticSearch was throwing ECONNRESET errors when requests where submitted in quick succession.
        await createIndex('users')
        await new Promise(resolve => setTimeout(resolve, 100))
        await createIndex('groups')
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
        if (!group)
            throw error.GROUP_NOT_FOUND(groupId)
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

        async function addGroupToUser(userId, groupId) {
            debug(`Adding group '${groupId}' to user '${userId}'`)
            const user = await updateDocument('users', userId, {
                script: {
                    source: "if (!ctx._source.groups.contains(params.groups)) {ctx._source.groups.add(params.groups)}",
                    lang: "painless",
                    params: {groups: groupId},
                },
            })
        }

        const updateUser = await addGroupToUser(user.id, groupId)
        return group
    }

    // Delete a group
    async function deleteGroup(user, groupId) {
        debug(`Deleting group '${groupId}'`)
        const rsp = await deleteDocument('groups', groupId)
        if (!rsp)
            throw error.GROUP_NOT_FOUND(groupId)
        debug(`Deleted group: %O`, rsp)

        async function removeGroupFromUser(userId, groupId) {
            debug(`Removing group '${groupId}' from user '${userId}'`)
            const user = await updateDocument('users', userId, {
                script: {
                    source: "if (ctx._source.groups.contains(params.groups)) {ctx._source.groups.remove(ctx._source.groups.indexOf(params.groups))}",
                    lang: "painless",
                    params: {groups: groupId},
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
    async function addMovieToGroup(groupId, movie) {
        debug(`Adding Movie '${movie.id}' to group '${groupId}' with duration '${movie.runtimeMins}'`)
        const group = await getGroup(groupId)

        group.movies.push(movie.id)
        group.totalDuration += movie.runtimeMins
        const rsp = await updateDocument('groups', groupId, {doc: group})
        return rsp['get']['_source']
    }

    // Remove a movie from a group
    async function removeMovieFromGroup(groupId, movie) {
        debug(`Removing movie '${movie.id}' from group '${groupId}'`)
        const group = await getGroup(groupId)

        const moviesLength = group.movies.length
        group.movies = group.movies.filter(m => m !== movie.id)
        if (moviesLength === group.movies.length)
            throw error.MOVIE_NOT_FOUND(`Movie '${movie.id}' not found in group '${groupId}'`)
        group.totalDuration -= movie.runtimeMins
        const rsp = await updateDocument('groups', groupId, {doc: group})

        return rsp['get']['_source']
    }

    // Create a new user in ElasticSearch DB
    async function createUser(username, email, password) {
        const user = {id: await getNextId('users'), username: username, email: email, password: password, token: crypto.randomUUID(), groups: []}
        const rsp = await putDocument('users', user.id, user)
        debug(`Created user: '${user.id}' - username: '${user.username}' - '${user.token}'`)
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

    // Create index in ElasticSearch DB
    async function createIndex(index) {
        const idx = await fetch(`${ELASTIC_URL}/${index}`, {method: 'HEAD'})
        if (idx.status === 200) {
            debug(`Index '${index}' already exists.`)
            return
        }
        // ElasticSearch was throwing ECONNRESET errors when requests where submitted in quick succession.
        await new Promise(resolve => setTimeout(resolve, 100))
        debug(`Creating index: '${index}'`)
        const rsp = await fetch(`${elasticUrl}/${index}`, {method: 'PUT',  ...DEFAULT_HEADERS})
        if (rsp.status === 200) {
            debug(`Index '${index}' created successfully.`)
        } else {
            throw error.UNKNOWN(`Error creating index '${index}'`)
        }
    }

    // Get user by username from ElasticSearch DB
    async function getUserByUsername(username) {
        debug(`getUserByUsername with username: '${username}'`)
        const q = {query: {match: {username: username}}}
        const rsp = await searchDocument('users', q)
        debug(`search Rsp: %O`, rsp)
        if (rsp['total']['value'] >= 1) {
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
        const data = await fetchFromES(`${index}/_doc/${id}?refresh=wait_for`, 'PUT', document)
        // debug(`putDocument response: %O`, data)
        return data
    }

    // Upload document with POST to ElasticSearch index
    async function postDocument(index, document) {
        debug(`postDocument on index: '${index}' document: %O`, document)
        const data = await fetchFromES(`${ELASTIC_URL}/${index}/_doc?refresh=wait_for`, 'POST', document)
        debug(`postDocument response: %O`, data)
        return data
    }

    //Update document with POST to ElasticSearch index
    async function updateDocument(index, id, document) {
        debug(`updateDocument on index: '${index}' id: '${id}' document: %O`, document)
        const data = await fetchFromES(`${index}/_update/${id}?_source&refresh=wait_for`, 'POST', document)
        debug(`updatedocument response: %O`, data)
        return data
    }

    // Download document with GET to ElasticSearch index
    async function getDocument(index, id) {
        debug(`getDocument on index: '${index}' id: '${id}'`)
        const data = await fetchFromES(`${index}/_doc/${id}`, 'GET')
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
        debug(`searchDocument response: %O`, data)
        return data['hits']
    }

    async function deleteDocument(index, id) {
        debug(`deleteDocument on index: '${index}' id: '${id}'`)
        const data = await fetchFromES(`${index}/_doc/${id}?refresh=wait_for`, 'DELETE')
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
        if (response.status !== 200 && response.status !== 201) {
            debug(`ElasticSearch '${ELASTIC_URL}/${url_path}' method '${method}' returned non-200 status code: ${response.status}`)
            throw error.UNKNOWN(`ElasticSearch '${ELASTIC_URL}/${url_path}' method '${method}' returned non-200 status code: ${response.status}`)
        }
        return await response.json()
    }
}
