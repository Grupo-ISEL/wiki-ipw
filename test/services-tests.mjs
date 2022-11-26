import groupServices from "../services/cmdb-services-groups.mjs";
import cmdbData from "../data/cmdb-data-mem.mjs";
import imdbMoviesData from "../data/imdb-movies-data.mjs";
import {testData} from "./testsData.mjs";
import error from "../errors.mjs";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";


const should = chai.should()
chai.use(chaiAsPromised)


describe('cmdb-services-groups tests', function () {

    const servicesGroups = groupServices(cmdbData,imdbMoviesData)

    const user1 = testData.mochUser
    const validTestToken = user1.token
    describe('handle token validation tests & getGroups tests', function () {

        it(`successful token validation scenario & return of user1 groups`, async function () {

            let res = await servicesGroups.getGroups(validTestToken)
            return chai.assert.deepEqual(res, testData.mochUserGroups, "Groups are not equal")

        })
        it('unsuccessful token validation scenario', async function () {
            return await servicesGroups.getGroups(testData.invalidToken)
                .should.be.rejectedWith(error.GROUPS_NOT_FOUND.message)
        })


    })
    describe('getGroup test', function () {

        it('successful group acquisition scenario', async function () {
            let res = await servicesGroups.getGroup(validTestToken, testData.mochUserGroups[0].id)

            return chai.assert.deepEqual(res, testData.mochUserGroups[0])
        })
        it('should throw due to invalid groupId', async function () {
            //GroupId is passed as undefined
            return await servicesGroups.getGroup(validTestToken)
                .should.be.rejectedWith(error.INVALID_PARAMETER.message)
        })
        it('should throw due to nonexistent groupId', async function () {
            //GroupId is passed with an int value that does not exist in the database
            return servicesGroups.getGroup(validTestToken, testData.intInjection).should.be
                .rejectedWith(error.GROUPS_NOT_FOUND.message)
        })
        it('should throw due to group not belonging to user', async function () {
            //GroupId does not belong to user
            return servicesGroups.getGroup(validTestToken, testData.notUserGroup.id).should.be
                .rejectedWith(error.GROUP_ACCESS_DENIED.message)
        })
    })
    describe('creatGroup test', function () {
        const group = testData.mochUserGroups[0]
        it('successful group creation scenario', async function () {

            let res = await servicesGroups.createGroup(validTestToken,group.name,group.description)
            chai.assert.isNotNaN(res.id,"Result should have a valid id Int property")
            chai.assert.isString(res.name,"Result should have a string as name property")
            chai.assert.isString(res.description,"Result should have a string as description property")
            chai.assert.isArray(res.movies,"Result should have an array property named movies to store movie ids")
            chai.assert.isNotNaN(res.totalDuration,"Result should have a valid totalDuration Int property")
            chai.assert.isNotNaN(res.userId,"Result should have a valid userId Int property")
            //Object res has been successfully built and returned
            return
        })
        it('successfully dealing with excess arguments', async function () {

            let res = await servicesGroups.createGroup(validTestToken,group.name,group.description,group,group)
            chai.assert.isNotNaN(res.id,"Result should have a valid id Int property")
            chai.assert.isString(res.name,"Result should have a string as name property")
            chai.assert.isString(res.description,"Result should have a string as description property")
            chai.assert.isArray(res.movies,"Result should have an array property named movies to store movie ids")
            chai.assert.isNotNaN(res.totalDuration,"Result should have a valid totalDuration Int property")
            chai.assert.isNotNaN(res.userId,"Result should have a valid userId Int property")
            //Object res has been successfully built and returned
            return
        })
        it('should throw due to faulty dataBase response', async function () {

            const servicesWithBadDatabase = groupServices(testData.faultyGroupDataBase,imdbMoviesData)
            //Database does not return a valid group
            return await servicesWithBadDatabase.createGroup(validTestToken,group.name,group.description)
                .should.be.rejectedWith(error.UNKNOWN.message)
        })
        it('should throw due to group not belonging to user', async function () {
            //GroupId does not belong to user
            return servicesGroups.getGroup(validTestToken, testData.notUserGroup.id).should.be
                .rejectedWith(error.GROUP_ACCESS_DENIED.message)
        })
    })
})
