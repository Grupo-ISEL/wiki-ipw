import request from 'supertest'
import app from '../cmdb-server.mjs'
import chai from 'chai'

let expect = chai.expect


describe('CMDB - Integration Tests', function () {
    after(function (done) {
        app.close(done)
    })

    // Create a user
    let token
    describe('POST /users', function () {
        it('createUser', function (done) {
            this.timeout(5000)
            request(app)
                .post('/users')
                .set('Accept', 'application/json')
                .send({username: 'andre'})
                .expect('Content-Type', /json/)
                .expect((res) => {
                    token = res.body.token
                    res.body.id = 4
                    res.body.token = '1234abcd'
                })
                .expect(201, {
                    status: 'New user created',
                    id: 4,
                    username: 'andre',
                    token: '1234abcd',
                }, done)
        })
    })

    // Get Top Movies
    describe('GET /movies/top', function () {
        it('should return top movies', function (done) {
            console.log(token)
            request(app)
                .get('/movies/top')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
        it('set offset', function (done) {
            request(app)
                .get('/movies/top?offset=10')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
        it('set limit', function (done) {
            request(app)
                .get('/movies/top?limit=10')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(200, done)
        })
        it('set offset and limit', function (done) {
            request(app)
                .get('/movies/top?offset=10&limit=10')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
        it('set offset and limit with invalid values', function (done) {
            request(app)
                .get('/movies/top?offset=a&limit=-1')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
    })

    // Search Movies
    describe('GET /movies', function () {
        it('search movie', function (done) {
            request(app)
                .get('/movies/?search=shaw')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) return done(err)
                    expect(res.body).to.be.an('array')
                    expect(res.body[0]).to.have.all.keys('id', 'title', 'year', 'runtimeMins', 'imdbRating', 'imageUrl', 'description', 'directors', 'writers', 'actors')
                    done()
                })
        })

        it('no search string', function (done) {
            request(app)
                .get('/movies')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, {
                    error: "Invalid argument search string is required",
                }, done)
        })
    })

    // Get Movie by ID
    describe('GET /movies/:id', function () {
        it('get movie', function (done) {
            request(app)
                .get('/movies/tt0111161')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
        it('non-existant movie id', function (done) {
            request(app)
                .get('/movies/1234')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
    })

    // Get groups belonging to the user
    describe('GET /groups', function () {
        it('no authentication', function (done) {
            request(app)
                .get('/groups')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })

        it('user authenticated, no groups', function (done) {
            request(app)
                .get('/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(200, [], done)
        })
    })

    // Get group by ID
    describe('GET /groups/1', function () {
        it('no authentication', function (done) {
            request(app)
                .get('/groups')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('user authenticated, non-existent group', function (done) {
            request(app)
                .get('/groups/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
    })

    // Create group
    let group
    describe('POST /groups', function () {
        it('no authentication', function (done) {
            request(app)
                .post('/groups')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('user authenticated, group creation, empty body', function (done) {
            request(app)
                .post('/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group creation, invalid body', function (done) {
            request(app)
                .post('/groups')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({name: 'test'})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group creation, valid body', function (done) {
            this.timeout(5000)
            request(app)
                .post('/groups')
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
    describe('PUT /groups/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .put(`/groups/${group.id}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('user authenticated, group update, empty body', function (done) {
            request(app)
                .put(`/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group update, invalid body', function (done) {
            request(app)
                .put(`/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({name: 'test'})
                .expect('Content-Type', /json/)
                .expect(400, done)
        })
        it('user authenticated, group update, valid body', function (done) {
            this.timeout(5000)
            group = {...group, name: 'New Name', description: 'New Description'}
            request(app)
                .put(`/groups/${group.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send({name: 'New Name', description: 'New Description'})
                .expect('Content-Type', /json/)
                .expect(200, {
                    status: 'Group updated',
                    group: group
                }, done)
        })
    })

    // Add movie to group
    const movieId = 'tt0111161'
    describe('PUT /groups/:id/movies/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .put(`/groups/${group.id}/movies/1`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('user authenticated, non-existent group', function (done) {
            request(app)
                .put('/groups/0/movies/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, non-existent movie', function (done) {
            request(app)
                .put(`/groups/${group.id}/movies/tt0000000`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, valid body', function (done) {
            this.timeout(5000)
            request(app)
                .put(`/groups/${group.id}/movies/${movieId}`)
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
    describe('DELETE /groups/:id/movies/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .delete(`/groups/${group.id}/movies/1`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
        it('user authenticated, non-existent group', function (done) {
            request(app)
                .delete('/groups/0/movies/1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, non-existent movie', function (done) {
            request(app)
                .delete(`/groups/${group.id}/movies/tt0000000`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
        it('user authenticated, valid body', function (done) {
            this.timeout(5000)
            request(app)
                .delete(`/groups/${group.id}/movies/${movieId}`)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(200, {
                    status: `Movie ${movieId} removed from group`,
                    group: {
                        ...group,
                        movies: [],
                        totalDuration: 0
                    }
                }, done)
        })
    })

    // Delete group by ID
    describe('DELETE /groups/:id', function () {
        it('no authentication', function (done) {
            request(app)
                .delete(`/groups/${group.id}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })

        it('user authenticated, non-existent group', function (done) {
            request(app)
                .delete('/groups/0')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .expect('Content-Type', /json/)
                .expect(404, done)
        })

        it('user authenticated', function (done) {
            this.timeout(5000)
            request(app)
                .delete(`/groups/${group.id}`)
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



