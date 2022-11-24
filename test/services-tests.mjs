import servicesGroups from "../services/cmdb-services-groups.mjs";
import {testData} from "./testsData.mjs";
import error from "../errors.mjs";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";


const should = chai.should()
chai.use(chaiAsPromised)


describe('cmdb-services-groups tests', function () {

    const user1 = testData.mochUser
    const validTestToken = user1.token
    describe('handle token validation tests & getGroups tests', function () {

        it(`successful token validation scenario & return of user1 groups`,async function () {

            let res = await servicesGroups.getGroups(validTestToken)
            return chai.assert.deepEqual(res,testData.mochUserGroups, "Groups are not equal")

        })
        it('unsuccessful token validation scenario', async function (){
            return await servicesGroups.getGroups(testData.invalidToken)
                .should.be.rejectedWith(error.GROUPS_NOT_FOUND.message)
        })


    })
    describe('getGroup test', function () {

        it('successful group acquisition scenario', async function () {
            let res = await servicesGroups.getGroup(validTestToken,testData.mochUserGroups[0].id)

            return chai.assert.deepEqual(res,testData.mochUserGroups[0])
        } )
        it('should throw due to invalid groupId', async function () {
            //GroupId is passed as undefined
            return await servicesGroups.getGroup(validTestToken)
                .should.be.rejectedWith(error.INVALID_PARAMETER.message)
        } )
        it('should throw due to nonexistent groupId', async function () {
            //GroupId is passed with an int value that does not exist in the database
            return servicesGroups.getGroup(validTestToken,testData.intInjection).should.be
                .rejectedWith(error.GROUPS_NOT_FOUND.message)
        } )
        it('should throw due to group not belonging to user', async function () {
            //GroupId does not belong to user
            return servicesGroups.getGroup(validTestToken,testData.notUserGroup.id).should.be
                .rejectedWith(error.GROUP_ACCESS_DENIED.message)
        } )



    })
})
