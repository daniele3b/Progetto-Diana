const request = require('supertest')
const {getTokens} = require('../../helper/test_helper')

let server

jest.setTimeout(20000)

describe('/air_traffic', () => {

    let operator_token
    let citizen_token
    let admin_token

    beforeEach(() => {
        server = require('../../index')

        const tokens = getTokens()
        
        citizen_token = tokens[0]
        operator_token = tokens[1]
        admin_token = tokens[2]
    })

    afterEach(async () => {
        await server.close()
    })

    describe('/GET', () => {
        
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/air_traffic')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/air_traffic')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/air_traffic')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return:\n  -404 if there are no planes in the specified area\n  -200 if there are planes in the area specified', async () => {
            let res = await request(server).get('/air_traffic').set('x-diana-auth-token', operator_token);
            if(res.status == 404)
                expect(res.status).toBe(404)
            else
                expect(res.status).toBe(200)

            res = await request(server).get('/air_traffic').set('x-diana-auth-token', admin_token);
            if(res.status == 404)
                expect(res.status).toBe(404)
            else
                expect(res.status).toBe(200)
        })

    })
})