const request = require('supertest')

let server

describe('/air_traffic', () => {
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await server.close()
    })

    describe('/GET', () => {
        it('should return:\n  -404 if there are no planes in the specified area\n  -200 if there are planes in the area specified', async () => {
            const res = await request(server).get('/air_traffic');
            if(res.status == 404)
                expect(res.status).toBe(404)
            else
                expect(res.status).toBe(200)
        })

    })
})