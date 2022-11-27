import groupServices from "../services/cmdb-services-groups.mjs";
import movieServices from "../services/cmdb-services-movies.mjs"
import cmdbData from "../data/cmdb-data-mem.mjs";
import moviesData from "../data/imdb-movies-data.mjs";
import userServices from "../services/cmdb-services-users.mjs"
import {testData} from "./testsData.mjs";
import error from "../errors.mjs";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {MAX_LIMIT} from "../services/cmdb-services-constants.mjs";


const should = chai.should()
chai.use(chaiAsPromised)


describe('cmdb-services-groups tests', function () {

    const servicesGroups = groupServices(cmdbData, testData)

    const user1 = testData.mochUser
    const validTestToken = user1.token
    describe('handle token validation tests & getGroups tests', function () {

        it(`successful token validation scenario & return of user1 groups`, async function () {

            let res = await servicesGroups.getGroups(validTestToken)
            chai.assert.deepEqual(res, testData.mochUserGroups, "Groups are not equal")

        })
        it('unsuccessful token validation scenario', async function () {
            await servicesGroups.getGroups(testData.invalidToken)
                .should.be.rejectedWith(error.GROUPS_NOT_FOUND.message)
        })


    })
    describe('getGroup test', function () {

        it('successful group acquisition scenario', async function () {
            let res = await servicesGroups.getGroup(validTestToken, testData.mochUserGroups[0].id)

            chai.assert.deepEqual(res, testData.mochUserGroups[0])
        })
        it('should throw due to invalid groupId', async function () {
            //GroupId is passed as undefined
            await servicesGroups.getGroup(validTestToken)
                .should.be.rejectedWith(error.INVALID_PARAMETER.message)
        })
        it('should throw due to nonexistent groupId', async function () {
            //GroupId is passed with an int value that does not exist in the database
            servicesGroups.getGroup(validTestToken, testData.intInjection).should.be
                .rejectedWith(error.GROUPS_NOT_FOUND.message)
        })
        it('should throw due to group not belonging to user', async function () {
            //GroupId does not belong to user
            servicesGroups.getGroup(validTestToken, testData.notUserGroup.id).should.be
                .rejectedWith(error.GROUP_ACCESS_DENIED.message)
        })
    })
    describe('createGroup test', function () {
        const group = testData.mochUserGroups[0]
        it('successful group creation scenario', async function () {

            let res = await servicesGroups.createGroup(validTestToken, group.name, group.description)
            chai.assert.isObject(res, "Result should be an object")
            chai.assert.isNotNaN(res.id, "Result should have a valid id Int property")
            chai.assert.isString(res.name, "Result should have a string as name property")
            chai.assert.isString(res.description, "Result should have a string as description property")
            chai.assert.isArray(res.movies, "Result should have an array property named movies to store movie ids")
            chai.assert.isNotNaN(res.totalDuration, "Result should have a valid totalDuration Int property")
            chai.assert.isNotNaN(res.userId, "Result should have a valid userId Int property")
            //Object res has been successfully built and returned

        })
        it('successfully dealing with excess arguments', async function () {//Vale mesmo a pena testar?

            let res = await servicesGroups.createGroup(validTestToken, group.name, group.description, group, group)
            chai.assert.isObject(res, "Result should be an object")
            chai.assert.isNotNaN(res.id, "Result should have a valid id Int property")
            chai.assert.isString(res.name, "Result should have a string as name property")
            chai.assert.isString(res.description, "Result should have a string as description property")
            chai.assert.isArray(res.movies, "Result should have an array property named movies to store movie ids")
            chai.assert.isNotNaN(res.totalDuration, "Result should have a valid totalDuration Int property")
            chai.assert.isNotNaN(res.userId, "Result should have a valid userId Int property")
            //Object res has been successfully built and returned

        })
        it('should throw due to faulty dataBase returning undefined group response', async function () {

            const servicesWithBadDatabase = groupServices(testData.unresponsiveGroupDataBase, testData)
            //Database does not return a valid group

            await servicesWithBadDatabase.createGroup(validTestToken, group.name, group.description)
                .should.be.rejectedWith(error.UNKNOWN.message)
        })

        it('should throw due to non existent user', async function () {
            //GroupId does not belong to user
            await servicesGroups.getGroup(testData.invalidToken, group.name, group.description).should.be
                .rejectedWith(error.GROUPS_NOT_FOUND.message)
        })
    })
    describe('update group tests', function () {
        const newGroup = testData.modifiedUserGroup
        it('should successfully alter the group to equal testGroup', async function () {
            const groupInfo = testData.mochUserGroups[0]
            let res = await servicesGroups.updateGroup(validTestToken,
                groupInfo.id, newGroup.name, newGroup.description)

            chai.assert.hasAllKeys(res, newGroup, "Result properties should not have been modified")
            chai.assert.equal(res.id, newGroup.id, "Id should not have been altered")
            chai.assert.isString(res.name, "Name should still be a string")
            chai.assert.equal(res.name, newGroup.name, "Name is not as requested")
            chai.assert.isString(res.description, "Description should still be a string")
            chai.assert.equal(res.description, newGroup.description, "Description is not as requested")
            chai.assert.deepEqual(res.movies, newGroup.movies, "Movies should not have been altered")
            chai.assert.equal(res.totalDuration, newGroup.totalDuration, "Total duration should not have been altered")
            chai.assert.equal(res.userId, newGroup.userId, "Group should still belong to same user")
            //Since function works as intended, to reverse changes
            await servicesGroups.updateGroup(validTestToken, groupInfo.id, groupInfo.name, groupInfo.description)

        })
        it('should throw due to faulty dataBase returning undefined group response', async function () {
            //Database does not return a valid group
            const servicesWithBadDatabase = groupServices(testData.unresponsiveGroupDataBase, testData)

            await servicesWithBadDatabase
                .updateGroup(
                    validTestToken,
                    testData.mochUserGroups[0].id,
                    newGroup.name,
                    newGroup.description
                ).should.be.rejectedWith(error.UNKNOWN.message)
        })

    })
    describe(' delete group tests', function () {
        const toDelete = testData.mochUserGroups[1]
        it('should successfully return the deleted group', async function () {

            let res = await servicesGroups.deleteGroup(validTestToken, toDelete.id)

            chai.assert.equal(res.id, toDelete.id, "Id should not have been altered")
            chai.assert.equal(res.name, toDelete.name, "Name should not have been altered")
            chai.assert.equal(res.description, toDelete.description, "Description should not have been altered")
            chai.assert.equal(res.totalDuration, toDelete.totalDuration, "Total duration should not have been altered")
            chai.assert.equal(res.userId, toDelete.userId, "GroupId should not have been altered")


        })

        it('should throw due to faulty dataBase returning undefined group response when trying to delete', async function () {
            //Database does not return a valid group
            const servicesWithBadDatabase = groupServices(testData.unresponsiveGroupDataBase, testData)

            await servicesWithBadDatabase
                .deleteGroup(
                    validTestToken,
                    testData.mochUserGroups[0].id
                ).should.be.rejectedWith(error.UNKNOWN.message)
        })

    })
    describe('add movie to group test', function () {
        //Also tests handleGroupMovieActions
        const targetGroup = testData.mochUserGroups[0]
        it('successfully adding a movie to the group', async function () {

            let res = await servicesGroups.addMovieToGroup(validTestToken, targetGroup.id, testData.newMovieId)
            chai.assert.equal(res.id, targetGroup.id, "Group ID should remain the same")
            chai.assert.equal(res.name, targetGroup.name, "Name should remain the same")
            chai.assert.equal(res.description, targetGroup.description, "Description should remain the same")
            chai.assert.equal(res.movies[res.movies.length - 1],
                testData.newMovieId,
                "Desired id was not place in the movies array")
            chai.assert.isAbove(res.totalDuration, targetGroup.totalDuration - 1,
                "Total duration cannot be lower than original")
            chai.assert.equal(res.userId, targetGroup.userId, "GroupId should not have been altered")
        })

        it('should throw due to faulty cmdb dataBase', async function () {
            const servicesWithBadDatabase = groupServices(testData.unresponsiveGroupDataBase, testData)

            await servicesWithBadDatabase.addMovieToGroup(validTestToken, targetGroup.id, testData.newMovieId)
                .should.be.rejectedWith(error.UNKNOWN.message)

        })
        it('should throw due to faulty movie dataBase', async function () {
            const servicesWithBadDatabase = groupServices(cmdbData, testData.unresponsiveMovieDataBase)

            await servicesWithBadDatabase.addMovieToGroup(validTestToken, targetGroup.id, testData.newMovieId)
                .should.be.rejectedWith(error.MOVIE_NOT_FOUND.message)

        })
    })
    describe('remove movie from group test', function () {
        const targetGroup = testData.mochUserGroups[0]
        it('successfully removing a movie from the group', async function () {
            const movieToRemove = targetGroup.movies[0]

            const storedMovies = await servicesGroups.getGroup(validTestToken, targetGroup.id)
            const finalSize = storedMovies.movies.length - 1

            let res = await servicesGroups.removeMovieFromGroup(validTestToken, targetGroup.id, movieToRemove)
            let decision = res.movies.find(movie => movie === movieToRemove)

            chai.assert.equal(res.id, targetGroup.id, "Group ID should remain the same")
            chai.assert.equal(res.name, targetGroup.name, "Name should remain the same")
            chai.assert.equal(res.description, targetGroup.description, "Description should remain the same")
            chai.assert.isUndefined(decision, "Movie should no longer be in the array")
            chai.assert.equal(res.movies.length, finalSize, "Movies should have only one less element")
            /*chai.assert.isBelow(res.totalDuration, targetGroup.totalDuration + 1,
                "Total duration cannot be higher than original")*/ // TODO: duration management yet to implement
            chai.assert.equal(res.userId, targetGroup.userId, "GroupId should not have been altered")
        })

    })
})

describe('cmdb-services-movies tests', function () {
    const servicesMovies = movieServices(testData.movieDatabaseTests)
    describe('get movie test', function () {

        it('should get a movie id', async function () {
            const movie = testData.mochUserGroups[0]
            let res = await servicesMovies.getMovie(movie.id)
            chai.assert.equal(res,movie,"Services should have located the test movie")
        })

        it('should throw due to missing movieId',async function(){
            await servicesMovies.getMovie().should.be.rejectedWith(error.INVALID_PARAMETER.message)
        })

    })
    describe('get top movies & handleMovieRequests tests ', function () {
        const offset = 3
        const limit = 50
        it('should return all 250 movies in testDatabase', async function () {

            let res = await servicesMovies.getTopMovies()
            let movies = await testData.savedMovies()
            chai.assert.deepEqual(res, movies, "Services has not returned all of the 250 movies")

        })

        it('should handle the desired offsets and limits', async function () {

            let res = await servicesMovies.getTopMovies(offset, limit)
            chai.assert.equal(res.length, limit, "Services should have respected de requested limit of movies")
            let movies = await testData.savedMovies()
            chai.assert.equal(res[0], movies[offset], "Services should have skipped the requested number of movies")
        })
        it('should deal with faulty movie dataBase', async function(){
            const faultyMovieDatabase = movieServices(testData.unresponsiveMovieDataBase)
            await faultyMovieDatabase.getTopMovies(offset, limit).should.be.rejectedWith(error.UNKNOWN.message)
        })

        describe('handle movie requests', function () {
            it('should handle the invalid offsets and limits being NAN', async function () {
                //Both parameters are not acceptable
                let offset = "explode"
                let limit = "fail"
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

                offset = 0
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

                offset = "explode"
                limit = 0
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

            })
            it('should handle the invalid offsets and limits being negative number', async function () {
                //Both parameters are not acceptable
                let offset = -20
                let limit = -1
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

                offset = 0
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

                offset = -1
                limit = 0
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

            })
            it('should handle the invalid offsets and limits being over the defined limit', async function () {
                //Both parameters are not acceptable
                let offset = 500
                let limit = 300
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

                offset = 50
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

                offset = 251
                limit = 60
                await servicesMovies.getTopMovies(offset, limit).should.be.rejectedWith(error.INVALID_PARAMETER.message)

            })
        })

    })
    describe('get searched movies', function () {

        it('should return a couple of searched movies', async function () {

            let res = await servicesMovies.getMovies(0,MAX_LIMIT,testData.moviesToSearchAndFind[0].description)
            chai.assert.deepEqual(res,testData.moviesToSearchAndFind,"Services should have located the similar movies")
        })
        it('should not find movies', async function () {
            let res = await servicesMovies.getMovies(0,MAX_LIMIT,testData.moviesToSearchAndFind[0].description)
            await servicesMovies.getMovies(0,MAX_LIMIT).should.be.rejectedWith(error.INVALID_PARAMETER.message)

        })
        it('should handle no search element', async function () {

            let res = await servicesMovies.getMovies(0,MAX_LIMIT,{})
            chai.assert.isEmpty(res,'Since search_text is not a searchable value, array should be empty')
            //Behavior not provided by services test is quetionable

        })

    })
})


describe('cmdb-services-users tests', function () {
    const servicesUsers = userServices(testData)
    describe('create user test', function () {
        it('should successfully create a new user', async function () {

            let res = await servicesUsers.createUser(testData.newUserData.name)
            chai.assert.containsAllDeepKeys(res, testData.newUserData)
            chai.assert.equal(res.id, testData.newUserData.id)
            chai.assert.equal(res.name, testData.newUserData.name)
            chai.assert.equal(res.token, testData.newUserData.token)
        })
        it('should throw due to faulty user dataBase', async function () {

            const faultyUserDatabase = userServices(testData.unresponsiveUserDataBase)

            faultyUserDatabase.createUser(testData.newUserData).should.be
                .rejectedWith(error.UNKNOWN.message)

        })

    })
})
