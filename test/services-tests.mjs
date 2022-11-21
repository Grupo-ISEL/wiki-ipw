import servicesGroups from "../services/cmdb-services-groups.mjs";
import {testData} from "./testsData.mjs";
import * as chai from "chai";
import assert from 'node:assert/strict'

describe('cmdb-services-groups tests', function () {

    const user1 = testData.users[0]

    describe('handle token validation tests & getGroups tests', function () {
        const validTestToken = user1.token
        it(`successful token validation scenario`,async function () {

            let res = await servicesGroups.getGroups(validTestToken)

            chai.assert.deepEqual(res,testData.id1Groups, "Groups are not equal")

        })
        it('unsuccessful token validation scenario', async function (){
            /*try {
                let res = await servicesGroups.getGroups(testData.invalidToken)
            }catch (e) {
                chai.assert.deepEqual(e,testData.groupNotFoundError)
            }*/
            chai.should().Throw(async () => await servicesGroups.getGroups(testData.invalidToken))
        })

    })
    //describe()
})
