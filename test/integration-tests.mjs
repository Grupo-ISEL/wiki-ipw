import request from 'supertest'
import chai from 'chai'
import crypto from 'node:crypto'
import cmdbDataMem from "../data/cmdb-data-mem.mjs";
import cmdbDataElastic from "../data/cmdb-data-elastic.mjs"
import imdbData from "../data/imdb-movies-data.mjs"
import mockFetch from "../data/imdb-mock-data.mjs"
import servicesInit from "../services/cmdb-services.mjs"
import apiInit from "../web/api/cmdb-api.mjs"
import siteInit from "../web/site/cmdb-web-site.mjs"
import createApp from '../cmdb.mjs'

// process.env.IMDB_API_KEY = 'k_0v6pmbzj'

const cmdbData = cmdbDataElastic('http://localhost:9200')
const moviesData = imdbData(mockFetch, 'k_1234abcd')

const services = servicesInit(cmdbData, moviesData)
const api = apiInit(services)
const site = siteInit(services)

let app = createApp(services, api, site)
let expect = chai.expect

function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

describe('CMDB - Integration Tests', function () {
    // Create a user
    let token
    describe('POST /api/users', function () {
        it('createUser', function (done) {
            this.timeout(10000)
            const user = {
                username: generateRandomString(8),
                email: 'andre@example.com',
                password: '1234qwe'
            }
            request(app)
                .post('/api/users')
                .set('Accept', 'application/json')
                .send(user)
                .expect('Content-Type', /json/)
                .expect((res) => {
                    token = res.body.token
                    res.body.id = 4
                    res.body.token = '1234abcd'
                })
                .expect(201, {
                    status: 'New user created',
                    id: 4,
                    ...user,
                    token: '1234abcd',
                }, done)
        })
    })

    // Get Top Movies
    describe('GET /api/movies/top', function () {
        it('should return top movies', function (done) {
            request(app)
                .get('/api/movies/top')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
        it('set offset', function (done) {
            request(app)
                .get('/api/movies/top?offset=10')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
        it('set limit', function (done) {
            request(app)
                .get('/api/movies/top?limit=10')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(200, done)
        })
        it('set offset and limit', function (done) {
            request(app)
                .get('/api/movies/top?offset=10&limit=10')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
        it('set offset and limit with invalid values', function (done) {
            request(app)
                .get('/api/movies/top?offset=a&limit=-1')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
    })

    // Search Movies
    describe('GET /api/movies', function () {
        it('search movie', function (done) {
            this.timeout(10000)
            request(app)
                .get('/api/movies/?search=inception')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) return done(err)
                    expect(res.body).to.be.an('array')
                    expect(res.body[0]).to.have.all.keys('id', 'title', 'description', 'imageUrl')
                    done()
                })
        })

        it('no search string', function (done) {
            request(app)
                .get('/api/movies')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, {
                    error: "Invalid argument search string is required",
                }, done)
        })
    })

    // Get Movie by ID
    describe('GET /api/movies/:id', function () {
        it('get movie', function (done) {
            request(app)
                .get('/api/movies/tt0111161')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, {
                    id: "tt0111161",
                    title: "The Shawshank Redemption",
                    year: 1994,
                    runtimeMins: 142,
                    imdbRating: 9.3,
                    imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMwNjQ5NjQxN15BMl5BanBnXkFtZTgwNjQ2NjUyMzE@._V1_SX300.jpg",
                    description: "Two imprisoned bla bla",
                    directors: "Frank Darabont",
                    writers: "Stephen King (short story \"Rita Hayworth and Shawshank Redemption\"), Frank Darabont (screenplay)",
                    actors: [
                        {
                            name: "Tim Robbins",
                            imageUrl: "https://m.media-amazon.com/images/M/MV5BMTI1OTYxNzAxOF5BMl5BanBnXkFtZTYwNTE5ODI4._V1_Ratio1.0000_AL_.jpg",
                        },
                        {
                            name: "Morgan Freeman",
                            imageUrl: "https://m.media-amazon.com/images/M/MV5BMTc0MDMyMzI2OF5BMl5BanBnXkFtZTcwMzM2OTk1MQ@@._V1_Ratio1.0000_AL_.jpg",
                        },
                    ],
                },done)
        })
        it('non-existent movie id', function (done) {
            request(app)
                .get('/api/movies/1234')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
    })

    // Get groups belonging to the user
    describe('GET /api/groups', function () {
        it('no authentication', function (done) {
            request(app)
                .get('/api/groups')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })

        it('non-existent user', function (done) {
            request(app)
                .get('/api/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer invalid-token')
                .expect('Content-Type', /json/)
                .expect(403, done)
        })

        it('user authenticated, no groups', function (done) {
            request(app)
                .get('/api/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(200, [], done)
        })
    })

// Get group by ID
    describe('GET /api/groups/1', function () {
        it('no authentication', function (done) {
            request(app)
                .get('/api/groups')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('non-existent user', function (done) {
            request(app)
                .get('/api/groups/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer invalid-token')
                .expect('Content-Type', /json/)
                .expect(403, done)
        })
        it('user authenticated, non-existent group', function (done) {
            request(app)
                .get('/api/groups/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
    })

// Create group
    let group
    describe('POST /api/groups', function () {
        it('no authentication', function (done) {
            request(app)
                .post('/api/groups')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('non-existent user', function (done) {
            request(app)
                .post('/api/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer invalid-token')
                .send({name: 'test', description: 'test'})
                .expect('Content-Type', /json/)
                .expect(403, done)
        })
        it('user authenticated, group creation, empty body', function (done) {
            request(app)
                .post('/api/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group creation, invalid body', function (done) {
            request(app)
                .post('/api/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({name: 'test'})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group creation, valid body', function (done) {
            this.timeout(10000)
            request(app)
                .post('/api/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({name: 'test', description: 'test'})
                .expect('Content-Type', /json/)
                .expect((res) => {
                    group = {...res.body.group}
                    res.body.group.id = 1
                })
                .expect(201, {
                    status: 'Group created',
                    group: {
                        id: 1,
                        name: 'test',
                        description: 'test',
                        movies: [],
                        totalDuration: 0,
                    },
                }, done)
        })
    })

// Update group
    describe('PUT /api/groups/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .put(`/api/groups/${group.id}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('non-existent user', function (done) {
            request(app)
                .put(`/api/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer invalid-token')
                .send({name: 'New Name', description: 'New Description'})
                .expect('Content-Type', /json/)
                .expect(403, done)
        })
        it('user authenticated, group update, empty body', function (done) {
            request(app)
                .put(`/api/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group update, invalid body', function (done) {
            request(app)
                .put(`/api/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({name: 'test'})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group update, valid body', function (done) {
            this.timeout(10000)
            group = {...group, name: 'New Name', description: 'New Description'}
            request(app)
                .put(`/api/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({name: 'New Name', description: 'New Description'})
                .expect('Content-Type', /json/)
                .expect(200, {
                    status: 'Group updated',
                    group: group,
                }, done)
        })
    })

// Add movie to group
    const movieId = 'tt0111161'
    describe('PUT /api/groups/:id/movies/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .put(`/api/groups/${group.id}/movies/1`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('non-existent user', function (done) {
            request(app)
                .put('/api/groups/0/movies/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer invalid-token')
                .expect('Content-Type', /json/)
                .expect(403, done)
        })
        it('user authenticated, non-existent group', function (done) {
            request(app)
                .put('/api/groups/0/movies/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, non-existent movie', function (done) {
            request(app)
                .put(`/api/groups/${group.id}/movies/tt0000000`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, valid body', function (done) {
            this.timeout(10000)
            request(app)
                .put(`/api/groups/${group.id}/movies/${movieId}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(200, {
                    status: 'Movie added to group',
                    group: {...group, movies: [movieId], totalDuration: 142},
                }, done)
        })
    })

// Add movie to group
    describe('DELETE /api/groups/:id/movies/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .delete(`/api/groups/${group.id}/movies/1`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('non-existent user', function (done) {
            request(app)
                .delete('/api/groups/0/movies/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer invalid-token')
                .expect('Content-Type', /json/)
                .expect(403, done)
        })
        it('user authenticated, non-existent group', function (done) {
            request(app)
                .delete('/api/groups/0/movies/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, non-existent movie', function (done) {
            this.timeout(10000)
            request(app)
                .delete(`/api/groups/${group.id}/movies/tt0000000`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, valid body', function (done) {
            this.timeout(10000)
            request(app)
                .delete(`/api/groups/${group.id}/movies/${movieId}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(200, {
                    status: `Movie ${movieId} removed from group`,
                    group: {
                        ...group,
                        movies: [],
                        totalDuration: 0,
                    },
                }, done)
        })
    })

// Delete group by ID
    describe('DELETE /api/groups/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .delete(`/api/groups/${group.id}`)
                .set('Accept', 'application/json')
                // .expect('Content-Type', /json/)
                .expect(401, done)
        })

        it('non-existent user', function (done) {
            request(app)
                .delete('/api/groups/0')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer invalid-token')
                .expect('Content-Type', /json/)
                .expect(403, done)
        })

        it('user authenticated, non-existent group', function (done) {
            request(app)
                .delete('/api/groups/0')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })

        it('user authenticated', function (done) {
            this.timeout(10000)
            request(app)
                .delete(`/api/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(200, {
                    status: 'Group deleted',
                    group: group,
                }, done)
        })
    })
})



