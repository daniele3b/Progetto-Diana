const request = require('supertest')
const mongoose = require('mongoose')
const {Report,validate}=require('../../models/report')
const {getTokens} = require('../../helper/test_helper')

let server

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

        

    })
})