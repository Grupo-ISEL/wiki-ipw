import groupServices from "../services/cmdb-services-groups.mjs";
import cmdbData from "../data/cmdb-data-mem.mjs";

import {testData} from "./testsData.mjs";
import error from "../errors.mjs";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";


const should = chai.should()
chai.use(chaiAsPromised)


describe('cmdb-services-groups tests', function () {

    const servicesGroups = groupServices(cmdbData, testData)

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

            return await servicesWithBadDatabase.createGroup(validTestToken, group.name, group.description)
                .should.be.rejectedWith(error.UNKNOWN.message)
        })

        it('should throw due to non existent user', async function () {
            //GroupId does not belong to user
            return await servicesGroups.getGroup(testData.invalidToken, group.name, group.description).should.be
                .rejectedWith(error.GROUPS_NOT_FOUND.message)
        })
    })
    describe('update group tests', function () {
        const newGroup = testData.modifiedUserGroup
        it('should successfully alter the group to equal testGroup', async function () {
            const groupInfo =  testData.mochUserGroups[0]
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
            return await servicesGroups.updateGroup(validTestToken,groupInfo.id,groupInfo.name,groupInfo.description)

        })
        it('should throw due to faulty dataBase returning undefined group response', async function () {
            //Database does not return a valid group
            const servicesWithBadDatabase = groupServices(testData.unresponsiveGroupDataBase,testData)

            return await servicesWithBadDatabase
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

            return await servicesWithBadDatabase
                .deleteGroup(
                    validTestToken,
                    testData.mochUserGroups[0].id
                ).should.be.rejectedWith(error.UNKNOWN.message)
        })

    })
    describe('add movie to group test',function () {
        const targetGroup = testData.mochUserGroups[1]
        it('successfully adding a movie to the group',async function () {

            let res = await servicesGroups.addMovieToGroup(validTestToken,targetGroup.id,testData.newMovieId.id)
            chai.assert.equal(res.id,targetGroup.id,"Group ID should remain the same")
            chai.assert.equal(res.name,targetGroup.name,"Name should remain the same")
            chai.assert.equal(res.description,targetGroup.description,"Description should reamin the same")
            chai.assert.equal(res.movies[res.movies.length - 1],
                testData.newMovieId,
                "Desired id was not place in the movies array")
            chai.assert.isAbove(res.totalDuration,targetGroup.totalDuration - 1,
                "Total duration cannot be lower than original")
            chai.assert.equal(res.userId,targetGroup.userId,"GroupId should not have been altered")
        })

        it('should throw due to faulty cmdb dataBase',async function () {
            const servicesWithBadDatabase = groupServices(testData.unresponsiveGroupDataBase,testData)

            return await servicesWithBadDatabase.addMovieToGroup(validTestToken,targetGroup.id,testData.newMovieId)

        })
    })
})
