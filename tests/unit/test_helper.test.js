const {getTokens} = require('../../helper/test_helper')

describe('getTokens', () => {
    it("should return an array of 3 tokens (citizen, operator, admin)", () => {
        const res = getTokens()
        expect(res).toBeTruthy()
        expect(res.length).toBe(3)
    })
})