import servicesGroups from "../services/cmdb-services-groups.mjs";
import {testData} from "./testsData.mjs";



describe('cmdb-services-groups tests', function () {

    const user1 = testData.users[0]

    describe('handle token validation tests', function () {
        const validTestToken = user1.token
        it(`should return an array with group objects`,async function () {
            // Act
            let res = servicesGroups.getGroups(validTestToken)
            // Assert
            res.then(groups => groups.should.equal(testData.id1Groups))
        })
    })
})
