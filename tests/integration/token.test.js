const request = require('supertest')
const mongoose = require('mongoose')
const {Report,validate}=require('../../models/report')

const {getTokens} = require('../../helper/test_helper')

jest.setTimeout(10000)

let server

describe('/token', () => {

    let operator_token
    let citizen_token
    let admin_token

    beforeEach( async () => {
        server = require('../../index')

        const report = new Report({
            id_number: 1,
            CF:"cvlmra98s29l120y",
            category:"incendio",
            address:"Via delle cornacchie",
            date:"2020-04-20T08:39:16.835Z",
            description: "Sta bruciando un gatto",
            status:"in attesa",
            visible: true,
            token:''
        })
        await report.save()

        const report2 = new Report({
            id_number: 2,
            CF:"NTRMNC99C57D662L",
            category:"altro",
            address:"Via delle cornacchie assunte",
            date:"2020-04-21T08:39:16.835Z",
            description: "Supercalifragili",
            status:"in attesa",
            visible: true,
            token:"BFLDNL98T02H501H"
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



    describe('/POST/setToken/:object/:id', () => {
        
        it('should return 200 if no token is setted', async () => {

            const res = await request(server)
                .post('/token/setToken/report/1')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200);
        });

        it('should return 400 if id of report is invalid ', async () => {

            const res = await request(server)
                .post('/token/setToken/report/invalid')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

        
        it('should return 403 if token of report is setted ', async () => {

            const res = await request(server)
                .post('/token/setToken/report/2')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(403);
        });

        

        it('should return 400 if type  is not report or annoucement', async () => {

            const res = await request(server)
                .post('/token/setToken/invalid/1')
                .set('x-diana-auth-token', operator_token);
                

            expect(res.status).toBe(400);
        });

        it('should return 401 if no token is provided', async () => {

            const res = await request(server)
                .post('/token/setToken/report/1')
                .set('x-diana-auth-token', '');
                

            expect(res.status).toBe(401);
        });

      

    })

    describe('/deleteToken/:object/:id', () => {
        
        it('should return 200 if  token is setted and token is equal to operator / admin cf', async () => {

            let res = await request(server)
            .post('/token/setToken/report/1')
            .set('x-diana-auth-token', admin_token);

             res = await request(server)
                .delete('/token/deleteToken/report/1')
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200);
        });

        it('should return 403 if  token is setted and token isnt equal to operator / admin cf', async () => {

            let res = await request(server)
            .post('/token/setToken/report/1')
            .set('x-diana-auth-token', admin_token);

             res = await request(server)
                .delete('/token/deleteToken/report/1')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(403);
        });

   

        it('should return 400 if id of report is invalid ', async () => {

            const res = await request(server)
                .delete('/token/deleteToken/report/invalid')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400);
        });

    
        it('should return 400 if type  is not report or annoucement', async () => {

            const res = await request(server)
                .delete('/token/deleteToken/invalid/1')
                .set('x-diana-auth-token', operator_token);
                

            expect(res.status).toBe(400);
        });

        it('should return 401 if no token is provided', async () => {

            const res = await request(server)
                .delete('/token/deleteToken/report/1')
                .set('x-diana-auth-token', '');
                

            expect(res.status).toBe(401);
        });

      

    })



   

})