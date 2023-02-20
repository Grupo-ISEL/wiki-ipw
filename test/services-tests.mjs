import cmdbDataMem from "../data/cmdb-data-mem.mjs"
// import servicesInit from "../services/cmdb-services.mjs"
import servicesUsersInit from "../services/cmdb-services-users.mjs"
import servicesMoviesInit from "../services/cmdb-services-movies.mjs"
import chai from 'chai'
import chaiAsPromised from "chai-as-promised"
import moviesDataInit from "../data/imdb-movies-data.mjs"
import mockFetch from "../data/imdb-mock-data.mjs"
import error from "../errors.mjs"
import {MAX_LIMIT} from "../services/cmdb-services-constants.mjs"
import servicesGroupsInit from "../services/cmdb-services-groups.mjs"


chai.use(chaiAsPromised)
let expect = chai.expect

const cmdbData = cmdbDataMem()
// const services = servicesInit(cmdbDataMem, moviesData, mockFetch)
const moviesData = moviesDataInit(mockFetch, "k_1234abcd", MAX_LIMIT)

process.env.NODE_ENV = 'test'

describe('CMDB - Services', function () {
    describe('Services Users', function () {
        const servicesUsers = servicesUsersInit(cmdbData)
        describe('createUser', function () {
            it('Creates a valid user', async function () {
                const result = await servicesUsers.createUser("andre", "andre@example.com", "1234")
                expect(result, "createUser should return user with all properties").to.have.all.keys('id', 'username', 'email', 'password', 'token', 'groups')
                expect(result.username, "createUser should return user with correct username").to.be.eql("andre")
                expect(result.email, "createUser should return user with correct email").to.be.eql("andre@example.com")
                expect(result.password, "createUser should return user with correct password").to.be.eql("1234")
                expect(result.token, "createUser should return user with correct token").to.be.a('string')
                expect(result.id, "createUser should return user id of type Number").to.be.a('Number')
                expect(result.groups, "createUser should return a groups array").to.be.an('Array').and.is.empty
            })
        })
    })
    describe('Services Movies Tests', function () {
        const servicesMovies = servicesMoviesInit(moviesData)

        describe('getTopMovies', function () {
            let result
            it('Returns an array with the correct number of movies', async function () {
                result = await servicesMovies.getTopMovies({offset: 0, limit: MAX_LIMIT})
                expect(result).to.be.an('array').and.have.lengthOf(MAX_LIMIT)
            })

            it('Returns an array of movies with the correct properties', function () {
                expect(result[0]).to.have.all.keys('id', 'title', 'year', 'imdbRating', 'rank', 'imageUrl')
            })

            it('Returns an array of movies with the correct information', function () {
                expect(result[0].id).to.be.eq('tt0111161')
                expect(result[0].title, "getTopMovies should return movies with correct title").to.be.eq('The Shawshank Redemption')
                expect(result[0].year, "getTopMovies should return movies with correct year").to.be.eq('1994')
                expect(result[0].imdbRating, "getTopMovies should return movies with correct imdbRating").to.be.eq('9.2')
                expect(result[0].rank, "getTopMovies should return movies with correct rank").to.be.eq('1')
                expect(result[0].imageUrl, "getTopMovies should return movies with correct imageUrl").to.be.eq('https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX128_CR0,3,128,176_AL_.jpg')
            })

            it('Using limit and offset should return an array with the correct number of movies', async function () {
                expect(await servicesMovies.getTopMovies({
                    offset: 0,
                    limit: 10,
                })).to.be.an('array').and.have.lengthOf(10)
                expect(await servicesMovies.getTopMovies({
                    offset: 245,
                    limit: 10,
                })).to.be.an('array').and.to.have.lengthOf(5)
            })

            it('Empty movieRequest object', function () {
                return expect(servicesMovies.getTopMovies({}), "getTopMovies should throw an error").to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument Offset and limit must be numbers")
            })

            it('Offset is not a number', function () {
                return expect(servicesMovies.getTopMovies({
                    offset: "a",
                    limit: 10,
                }), "getTopMovies should throw an error").to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument Offset and limit must be numbers")
            })

            it('Limit is not a number', function () {
                return expect(servicesMovies.getTopMovies({
                    offset: 0,
                    limit: "a",
                }), "getTopMovies should throw an error").to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument Offset and limit must be numbers")
            })

            it('Offset is negative', function () {
                return expect(servicesMovies.getTopMovies({
                    offset: -1,
                    limit: 10,
                }), "getTopMovies should throw an error").to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument Offset and limit must be positive")
            })

            it('Limit is negative', function () {
                return expect(servicesMovies.getTopMovies({
                    offset: 0,
                    limit: -1,
                }), "getTopMovies should throw an error").to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument Offset and limit must be positive")
            })

            it('Offset is larger than MAX_LIMIT', function () {
                return expect(servicesMovies.getTopMovies({
                    offset: MAX_LIMIT + 1,
                    limit: 10,
                }), "getTopMovies should throw an error").to.be.rejectedWith(error.INVALID_PARAMETER(), `Offset and limit must be less than or equal to ${MAX_LIMIT}`)
            })
            it('Limit is larger than MAX_LIMIT', function () {
                return expect(servicesMovies.getTopMovies({
                    offset: 0,
                    limit: MAX_LIMIT + 1,
                }), "getTopMovies should throw an error").to.be.rejectedWith(error.INVALID_PARAMETER(), `Offset and limit must be less than or equal to ${MAX_LIMIT}`)
            })
        })

        describe('getMovies/searchMovie', function () {
            it('valid search string', async function () {
                const result = await servicesMovies.getMovies({search: "inception", offset: 0, limit: 10})
                expect(result).to.be.an('array').and.have.lengthOf(5)
                expect(result[0]).to.have.all.keys('id', 'title', 'imageUrl', 'description')
            })
            it('Invalid search string', async function () {
                return expect(servicesMovies.getMovies({
                    search: undefined,
                    offset: 0,
                    limit: 10,
                })).to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument search string is required")
            })
            it('Empty search string', async function () {
                return expect(servicesMovies.getMovies({
                    search: "",
                    offset: 0,
                    limit: 10,
                })).to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument search string is required")
            })
        })

        describe('getMovie', function () {
            const movie = {
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
            }
            it('valid movie id', async function () {
                const result = await servicesMovies.getMovie("tt0111161")
                expect(result).to.deep.equal(movie)
            })
            it('Invalid movie id', async function () {
                return expect(servicesMovies.getMovie(undefined)).to.be.rejectedWith(error.INVALID_PARAMETER(), "Invalid argument movieId is required")
            })
        })
    })

    describe('Services Groups', function () {

        const token = '3280fcf9-eb87-4d44-b05e-12be5c7ba6e1'
        let groupId
        const servicesGroups = servicesGroupsInit(cmdbData, moviesData)
        describe('createGroup', function () {
            it('Create group with valid data', async function () {
                const group = await servicesGroups.createGroup(token, "Group Test", "Group Test Description")
                expect(group).to.be.an('object').and.have.all.keys('id', 'name', 'description', 'movies', 'totalDuration')
                expect(group.id).to.be.a('Number')
                expect(group.name).to.equal("Group Test")
                expect(group.description).to.equal("Group Test Description")
                expect(group.movies).to.be.an('array').and.is.empty
                expect(group.totalDuration).to.equal(0)
                groupId = group.id
            })
        })

        describe('getGroup', function () {
            it('Get group with valid id', async function () {
                const group = await servicesGroups.getGroup(token, groupId)
                expect(group).to.be.an('object').and.have.all.keys('id', 'name', 'description', 'movies', 'totalDuration')
                expect(group.id).to.equal(groupId)
                expect(group.name).to.equal("Group Test")
                expect(group.description).to.equal("Group Test Description")
                expect(group.movies).to.be.an('array').and.is.empty
                expect(group.totalDuration).to.equal(0)
            })

        })

        describe('getGroups', function () {
            it('Get user groups', async function () {
                const groups = await servicesGroups.getGroups(token)
                expect(groups).to.be.an('array').and.have.lengthOf(3)
                expect(groups[2]).to.be.an('object').and.have.all.keys('id', 'name', 'description', 'movies', 'totalDuration')
                expect(groups[2].id).to.equal(groupId)
                expect(groups[2].name).to.equal("Group Test")
                expect(groups[2].description).to.equal("Group Test Description")
                expect(groups[2].movies).to.be.an('array').and.is.empty
                expect(groups[2].totalDuration).to.equal(0)
            })
        })

        describe('updateGroup', function () {
            it('Update group with valid data', async function () {
                const group = await servicesGroups.updateGroup(token, 1, "Group Test 2", "Group Test Description 2")
                expect(group).to.be.an('object').and.have.all.keys('id', 'name', 'description', 'movies', 'totalDuration')
                expect(group.id).to.equal(1)
                expect(group.name).to.equal("Group Test 2")
                expect(group.description).to.equal("Group Test Description 2")
                expect(group.movies).to.be.an('array').and.eql(['tt0111161', 'tt1375666'])
                expect(group.totalDuration).to.equal(671)
            })
        })

        describe('addMovieToGroup', function () {
            it('Add movie to group with valid data', async function () {
                const group = await servicesGroups.addMovieToGroup(token, 1, "tt0071562")
                expect(group).to.be.an('object').and.have.all.keys('id', 'name', 'description', 'movies', 'totalDuration')
                expect(group.id).to.equal(1)
                expect(group.movies).to.be.an('array').and.have.lengthOf(3)
                expect(group.movies[2]).to.equal("tt0071562")
                expect(group.totalDuration).to.equal(671 + 202)
            })
        })

        describe('removeMovieFromGroup', function () {
            it('Remove movie from group with valid data', async function () {
                const group = await servicesGroups.removeMovieFromGroup(token, 1, "tt0111161")
                expect(group).to.be.an('object').and.have.all.keys('id', 'name', 'description', 'movies', 'totalDuration')
                expect(group.id).to.equal(1)
                expect(group.movies).to.be.an('array').and.have.lengthOf(1)
                expect(group.movies[0]).to.equal("tt1375666")
                expect(group.totalDuration).to.equal(671 - 142)
            })
        })

        describe('deleteGroup', function () {
            it('Delete group with valid id', async function () {
                const deletedGroup = await servicesGroups.deleteGroup(token, 1)
                expect(deletedGroup).to.be.an('object').and.have.all.keys('id', 'name', 'description', 'movies', 'totalDuration')
                expect(deletedGroup.id).to.equal(1)
                const groups = await servicesGroups.getGroups(token)
                expect(groups).to.be.an('array').and.have.lengthOf(1)
                expect(groups.find(group => group.id === 1)).to.be.undefined
            })
        })
    })
})




