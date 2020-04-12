const request = require('supertest')

let server

describe('/traffic', () => {
    beforeEach(() => {
        server = require('../../index')
    })
    afterEach(async () => {
        await server.close()
    })

    describe('/GET/:address', () => {
        it('should return all current data about traffic into an area specified by a given address', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)
        })
        it('should return 400 if invalid address is passed', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina 543/sensor');
            expect(res.status).toBe(400);
        })

    })

    describe('/GET/:address/sensor', () => {
        it('should return the nearest sensor for a specified address', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina/sensor');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)
        })

        it('should return 400 if invalid address is passed', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina 543/sensor');
            expect(res.status).toBe(400);
        })
    })

})