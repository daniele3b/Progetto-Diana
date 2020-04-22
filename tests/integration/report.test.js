const request = require('supertest')
const mongoose = require('mongoose')
const {Report,validate}=require('../../models/report')
const {getTokens} = require('../../helper/test_helper')

let server

jest.setTimeout(20000)

describe('/report', () => {

    let operator_token
    let citizen_token
    let admin_token

    beforeEach(async() => {
        server = require('../../index')

        const report = new Report({
            id_number: 1,
            CF:"cvlmra98s29l120y",
            category:"incendio",
            address:"Via delle cornacchie",
            date:"2020-04-20T08:39:16.835Z",
            description: "Sta bruciando un gatto",
            status:"in attesa",
            visible: true
        })
        await report.save()

        const report2 = new Report({
            id_number: 1,
            CF:"NTRMNC99C57D662L",
            category:"altro",
            address:"Via delle cornacchie assunte",
            date:"2020-04-21T08:39:16.835Z",
            description: "Supercalifragili",
            status:"in attesa",
            visible: true
        })
        await report2.save()

        const tokens = getTokens()
        
        citizen_token = tokens[0]
        operator_token = tokens[1]
        admin_token = tokens[2]

    })
    afterEach(async () => {
        await Report.deleteMany({})
        await server.close()
       
    })


    describe('GET /', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report')
                .set('x-diana-auth-token', operator_token);
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })

    describe('GET /filter/id/:id', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report/filter/id/1')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report/filter/id/1')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/report/filter/id/1')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 404', async () => {

            const res = await request(server)
                .get('/report/filter/id/9999999')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report/filter/id/1')
                .set('x-diana-auth-token', operator_token);
            
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })

    describe('GET /filter/CF/:cf', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report/filter/CF/cvlmra98s29l120y')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report/filter/CF/cvlmra98s29l120y')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/report/filter/CF/cvlmra98s29l120y')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 404', async () => {

            const res = await request(server)
                .get('/report/filter/CF/aaaaaaaaaaaaaaaa')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report/filter/CF/cvlmra98s29l120y')
                .set('x-diana-auth-token', operator_token);
            
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })


    describe('GET /filter/date/:date', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report/filter/date/2020-04-20')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report/filter/date/2020-04-20')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 400 bad request error date', async () => {

            const res = await request(server)
                .get('/report/filter/date/202w0-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/report/filter/date/2020-04-20')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 404', async () => {

            const res = await request(server)
                .get('/report/filter/date/3020-04-20')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report/filter/date/2020-04-21')
                .set('x-diana-auth-token', operator_token);
            
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })

    describe('GET /filter/date/:date_start/:date_end', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report/filter/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report/filter/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 400 bad request error date_start', async () => {

            const res = await request(server)
                .get('/report/filter/date/202w0-04-21/2020-04-22')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 400 bad request error date_end', async () => {

            const res = await request(server)
                .get('/report/filter/date/2020-04-21/202er0-04-22')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/report/filter/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 404', async () => {

            const res = await request(server)
                .get('/report/filter/date/3020-04-20/3020-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report/filter/date/2020-04-20/2020-04-22')
                .set('x-diana-auth-token', operator_token);
            
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })

    describe('GET /filter/category/:type', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 404 if there are not reports', async () => {

            const res = await request(server)
                .get('/report/filter/category/idrogeologia')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404);
        });

        it('should return 400 bad request error category', async () => {

            const res = await request(server)
                .get('/report/filter/category/noncorretto')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report/filter/category/incendio')
                .set('x-diana-auth-token', operator_token);
            
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })

    describe('GET /filter/category/:type/date/:date', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-21')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-21')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-21')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 404 if there are not reports', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-01')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404);
        });

        it('should return 400 bad request error category', async () => {

            const res = await request(server)
                .get('/report/filter/category/sbagliato/date/2020-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 400 bad request error date', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/202w0-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-20')
                .set('x-diana-auth-token', operator_token);
            
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })

    describe('GET /filter/category/:type/date/:date_start/:date_end', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 404 if there are not reports', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/3020-04-20/3020-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404);
        });

        it('should return 400 bad request error category', async () => {

            const res = await request(server)
                .get('/report/filter/category/sbagliato/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 400 bad request error date_start', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/20antonio-04-20/2020-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 400 bad request error date_end', async () => {

            const res = await request(server)
                .get('/report/filter/category/incendio/date/20-04-20/202wef0-04-21')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        it('should return 200 if is ok', async () => {
            const res = await request(server)
                .get('/report/filter/category/incendio/date/2020-04-20/2020-04-21')
                .set('x-diana-auth-token', operator_token);
            
            expect(typeof res.body[0].id_number).toBe("number");
            expect(typeof res.body[0].CF).toBe("string");
            expect(typeof res.body[0].category).toBe("string");
            expect(typeof res.body[0].address).toBe("string");
            expect(typeof res.body[0].description).toBe("string");
            expect(typeof res.body[0].status).toBe("string");
            expect(typeof res.body[0].visible).toBe("boolean");
            expect(res.status).toBe(200);
        });
        

    })

    describe('POST /', () => {

        let cateogory  
        let address
        let description
        let token

        const exec = async () => {
            return await request(server).post('/report')
                .set('x-diana-auth-token', token)
                .send({category,address,description})
        }

        it('should return 200 if is ok', async () => {
            token = citizen_token
            category = 'altro'
            address = 'via corna'
            description = 'caduto materasso'
            const res = await exec()

            expect(res.status).toBe(200);
        });

        it('should return 401 if user is not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
            token = 'invalid_token'

            const res = await exec()

            expect(res.status).toBe(400);
        });

        it('should return 400 if the request is not valid', async() => {
            category = 'tulipano'

            token = operator_token
            let res = await exec()
            
            expect(res.status).toBe(400)

            token = admin_token
            res = await exec()
            
            expect(res.status).toBe(400)
        })

        it('should return 400 if received duplicate', async () => {
            token = citizen_token
            category = 'incendio'
            address = 'via salsiccia'
            description = 'bruciato materasso'
            const res1 = await exec()
            const res2 = await exec()

            expect(res2.status).toBe(400);
        });

        it('should return 400 if max request in a day reach', async () => {
            token = citizen_token
            category = 'incendio'
            address = 'via salsiccia'
            description = 'prova1'
            const res1 = await exec()
            category = 'incendio'
            address = 'via salsiccia'
            description = 'prova2'
            const res2 = await exec()
            category = 'incendio'
            address = 'via salsiccia'
            description = 'prova3'
            const res3 = await exec()
            category = 'incendio'
            address = 'via salsiccia'
            description = 'prova4'
            const res4 = await exec()


            expect(res4.status).toBe(400);
        });

        
    })

})