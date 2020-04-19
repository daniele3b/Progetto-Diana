const request = require('supertest')
const mongoose = require('mongoose')
const {Agents,Chemical_Agent,validate}=require('../../models/chemical_agents')
const {getTokens} = require('../../helper/test_helper')

let server

describe('/chemical_agents', () => {

    let operator_token
    let citizen_token
    let admin_token

    beforeEach(async() => {
        server = require('../../index')

        const chemical_agent = new Chemical_Agent({
            reg_date: "2021-12-31",
            value: 100,
            types: Agents.CO,
            sensor:"prova",
            uid:"id_prova",
            lat:"666",
            long:"666"
        })
        await chemical_agent.save()

        const chemical_agent2 = new Chemical_Agent({
            reg_date: "2019-11-30",
            value: 100,
            types: Agents.SO2,
            sensor:"prova",
            uid:"id_prova",
            lat:"666",
            long:"666"
        })
        await chemical_agent2.save()

        const tokens = getTokens()
        
        citizen_token = tokens[0]
        operator_token = tokens[1]
        admin_token = tokens[2]

    })
    afterEach(async () => {
        await Chemical_Agent.deleteMany({})
        await server.close()
       
    })


    describe('GET /', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/chemical_agents')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/chemical_agents')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return all current data about all stations (latest available)' , async() => {
            let res = await request(server).get('/chemical_agents').set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return 404 if no data are available' , async() => {
            await Chemical_Agent.deleteMany({})
            let res = await request(server).get('/chemical_agents').set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
        })

    })


    describe('GET /:station_id', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/chemical_agents/current/id_prova')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/chemical_agents/current/id_prova')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return all current data about a station with the given station id', async() => {
            let res = await request(server).get('/chemical_agents/current/id_prova').set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents/current/id_prova').set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents/current/id_prova').set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
           
        })

        it('should return 404 if no station has the given station_id', async() => {
            let res = await request(server).get('/chemical_agents/nonesiste').set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/nonesiste').set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/nonesiste').set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(404)
        })
    })


    describe('GET /filter/date/:date_start/:date_end', () => {
        const date_start = "December 2021 , 30 17:30"
        const date_end = "December 2022 , 1 00:00"

        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return the list of all data of all stations between the start and end date', async () => {

            let res = await request(server).get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return 404 if no data belong to the specified dates range', async() => {
            const date_start = "March 1970 , 26 17:30"
            const date_end = "March 1971 , 30 00:00"

            let res = await request(server).get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
        })


        it('should return 400 if data doesnt exist', async() => {

            let res = await request(server).get('/chemical_agents/filter/date/nonesiste/noonesiste')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(400)

            res = await request(server).get('/chemical_agents/filter/date/nonesiste/noonesiste')
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(400)
        })
    })

    describe('GET /history', () => {
        
        describe('GET /history', () => {
            it('should return 401 if user is not logged in', async () => {
    
                const res = await request(server)
                    .get('/chemical_agents/history')
                    .set('x-diana-auth-token', '');
    
                expect(res.status).toBe(401);
            });
    
            it('should return 400 if token is not valid', async () => {
    
                const res = await request(server)
                    .get('/chemical_agents/history')
                    .set('x-diana-auth-token', 'invalid_token');
    
                expect(res.status).toBe(400);
            });
    
            it('should return 403 if user is not an operator or an admin', async () => {
    
                const res = await request(server)
                    .get('/chemical_agents/history')
                    .set('x-diana-auth-token', citizen_token);
    
                expect(res.status).toBe(403);
            });
    
            it('should return the list of all data of all stations ', async () => {
                let res = await request(server).get('/chemical_agents/history')
                    .set('x-diana-auth-token', operator_token);
                expect(res.status).toBe(200)
                expect(res.body.length).toBe(2)
    
                res = await request(server).get('/chemical_agents/history')
                    .set('x-diana-auth-token', admin_token);
                expect(res.status).toBe(200)
                expect(res.body.length).toBe(2)
            })
    
        })

    })
    
    describe('GET /history:type', () => {
        it('should return 401 if user is not logged in', async () => {
    
            const res = await request(server)
                .get('/chemical_agents/history/SO2')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
    
            const res = await request(server)
                .get('/chemical_agents/history/SO2')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/chemical_agents/history/SO2')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return the list of all data of all stations of a kind of agent', async () => {
            let res = await request(server).get('/chemical_agents/history/SO2')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents/history/SO2')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return 400 if type of agent dont exist', async () => {
            let res = await request(server).get('/chemical_agents/history/test')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400)

            res = await request(server).get('/chemical_agents/history/test')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400)
            
        })

        it('should return 404 if type of agent exist but there arent values', async () => {
            let res = await request(server).get('/chemical_agents/history/BENZENE')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/history/BENZENE')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
            
        })
    })


    describe('GET /history/station/:station_id', () => {
        it('should return 401 if user is not logged in', async () => {
    
            const res = await request(server)
                .get('/chemical_agents/history/station/id_prova')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
    
            const res = await request(server)
                .get('/chemical_agents/history/station/id_prova')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/chemical_agents/history/station/id_prova')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return the list of all data of a station', async () => {
            let res = await request(server).get('/chemical_agents/history/station/id_prova')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)

            res = await request(server).get('/chemical_agents/history/station/id_prova')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
        })

        it('should return 404 if the data arent available or station id dont exist', async () => {
            let res = await request(server).get('/chemical_agents/history/station/nonesiste')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/history/station/nonesiste')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
            
        })

    })

    describe('GET /history/station/:station_id/:type', () => {

        it('should return 401 if user is not logged in', async () => {
    
            const res = await request(server)
                .get('/chemical_agents/history/station/id_prova/CO')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
    
            const res = await request(server)
                .get('/chemical_agents/history/station/id_prova/CO')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/chemical_agents/history/station/id_prova/CO')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return the list of all data of a station of a kinf of agent', async () => {
            let res = await request(server).get('/chemical_agents/history/station/id_prova/CO')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents/history/station/id_prova/CO')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return 404 if station id dont exist', async () => {
            let res = await request(server).get('/chemical_agents/history/station/nonesiste/CO')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/history/station/nonesiste/CO')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
        })

        it('should return 404 if station id exist but there arent data', async () => {
            let res = await request(server).get('/chemical_agents/history/station/id_prova/BENZENE')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/history/station/id_prova/BENZENE')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
        })

        it('should return 400 if the type of agent dont exist', async () => {
            let res = await request(server).get('/chemical_agents/history/station/id_prova/nonesiste')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400)
            
            res = await request(server).get('/chemical_agents/history/station/id_prova/nonesiste')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400)
        })

    
    })

    describe('GET /filter/avg/:station_id/:type', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/avg/id_prova/CO')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/avg/id_prova/CO')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/avg/id_prova/CO')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
    
        it('should return the avg of all data of a kind of agent of a station', async () => {
            let res = await request(server).get('/chemical_agents/filter/avg/id_prova/CO')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('value', 100)

            res = await request(server).get('/chemical_agents/filter/avg/id_prova/CO')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('value', 100)
        })

        it('should return 400 if type of agent dont exist', async () => {
            let res = await request(server).get('/chemical_agents/filter/avg/id_prova/nonesiste')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400)

            res = await request(server).get('/chemical_agents/filter/avg/id_prova/nonesiste')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400)
        
        })

        it('should return 400 if the station doesnt exist', async () => {
            let res = await request(server).get('/chemical_agents/filter/avg/nonesiste/CO')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/filter/avg/nonesiste/CO')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
        
        })

        it('should return 404 if type of agent exist but there arent values', async () => {
            let res = await request(server).get('/chemical_agents/filter/avg/id_prova/BENZENE')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/filter/avg/id_prova/BENZENE')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
        
        })
    })

    describe('GET /filter/avg/:station_id/', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/avg/id_prova')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/avg/id_prova')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });
        
        it('should return the avg of all data of a station', async () => {
            let res = await request(server).get('/chemical_agents/filter/avg/id_prova')
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(200)
            
            expect(res.body[0].avg).toBe(100)
            expect(res.body[1].avg).toBe(100)

            res = await request(server).get('/chemical_agents/filter/avg/id_prova')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200)
            
            expect(res.body[0].avg).toBe(100)
            expect(res.body[1].avg).toBe(100)

            res = await request(server).get('/chemical_agents/filter/avg/id_prova')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200)
            
            expect(res.body[0].avg).toBe(100)
            expect(res.body[1].avg).toBe(100)
        })


        it('should return 404 if station_id doesnt exist', async () => {
            let res = await request(server).get('/chemical_agents/filter/avg/nonesiste')
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/filter/avg/nonesiste')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/filter/avg/nonesiste')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
            
        })
    })


    describe('GET /filter/date/:station_id/:date_start/:date_end', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/date/id_prova/2021-12-31/2021-12-31')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/date/id_prova/2021-12-31/2021-12-31')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/chemical_agents/filter/date/id_prova/2021-12-31/2021-12-31')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return all data of a station beetwen date_start and date_end', async () => {
            let res = await request(server).get('/chemical_agents/filter/date/id_prova/2021-12-31/2021-12-31')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)

            res = await request(server).get('/chemical_agents/filter/date/id_prova/2021-12-31/2021-12-31')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })


        it('should return 404 if station_id doesnt exist', async () => {
            let res = await request(server).get('/chemical_agents/filter/date/nonesiste/2021-12-31/2021-12-31')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/filter/date/nonesiste/2021-12-31/2021-12-31')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
            
        })


        it('should return 404 if there arent data beetwen date indicated doesnt exist', async () => {
            let res = await request(server).get('/chemical_agents/filter/date/id_prova/666-6-6/666-6-6')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404)

            res = await request(server).get('/chemical_agents/filter/date/id_prova/666-6-6/666-6-6')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404)
        })

        it('should return 404 if dates indicated doesnt exist', async () => {
            let res = await request(server).get('/chemical_agents/filter/date/id_prova/nonesiste/nonesiste')
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400)

            res = await request(server).get('/chemical_agents/filter/date/id_prova/nonesiste/nonesiste')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400)
        })
    })
}) 