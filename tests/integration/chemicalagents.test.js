const request = require('supertest')
const mongoose = require('mongoose')
const {Agents,Chemical_Agent,validate}=require('../../models/chemical_agents')

let server

describe('/chemical_agents', () => {
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
    })
    afterEach(async () => {
        await Chemical_Agent.deleteMany({})
        await server.close()
       
    })


    describe('GET /', () => {
        it('should return all current data about all stations (latest available)' , async() => {
            const res = await request(server).get('/chemical_agents')

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

    })


    describe('GET /:station_id', () => {
        it('should return all current data about a station with the given station id', async() => {
            const res = await request(server).get('/chemical_agents/current/id_prova')

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
           
        })

        it('should return 404 if no station has the given station_id', async() => {
            const res = await request(server).get('/chemical_agents/nonesiste')

            expect(res.status).toBe(404)
        })
    })


    describe('GET /filter/date/:date_start/:date_end', () => {
        it('should return the list of all data of all stations between the start and end date', async () => {
            const date_start = "December 2021 , 30 17:30"
            const date_end = "December 2022 , 1 00:00"

            const res = await request(server).get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return 404 if no data belong to the specified dates range', async() => {
            const date_start = "March 1970 , 26 17:30"
            const date_end = "March 1971 , 30 00:00"

            const res = await request(server).get('/chemical_agents/filter/date/' +date_start+ '/' +date_end)

            expect(res.status).toBe(404)
        })
    })

    describe('GET /history', () => {
        it('should return the list of all data of all stations ', async () => {
            const res = await request(server).get('/chemical_agents/history')
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
        })

    })

    describe('GET /history', () => {
        it('should return the list of all data of all stations ', async () => {
            const res = await request(server).get('/chemical_agents/history')
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
        })

    }) 
    
    describe('GET /history:type', () => {
        it('should return the list of all data of all stations of a kind of agent', async () => {
            const res = await request(server).get('/chemical_agents/history/SO2')
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return 400 if type of agent dont exist', async () => {
            const res = await request(server).get('/chemical_agents/history/test')
            expect(res.status).toBe(400)
            
        })

        it('should return 404 if type of agent exist but there arent values', async () => {
            const res = await request(server).get('/chemical_agents/history/BENZENE')
            expect(res.status).toBe(404)
            
        })
    })


    describe('GET /history/station/:station_id', () => {

        it('should return the list of all data of a station', async () => {
            const res = await request(server).get('/chemical_agents/history/station/id_prova')
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
        })

        it('should return 404 if the data arent available or station id dont exist', async () => {
            const res = await request(server).get('/chemical_agents/history/station/nonesiste')
            expect(res.status).toBe(404)
            
        })

    
    })

    describe('GET /history/station/:station_id/:type', () => {

        it('should return the list of all data of a station of a kinf of agent', async () => {
            const res = await request(server).get('/chemical_agents/history/station/id_prova/CO')
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return 404 if station id dont exist', async () => {
            const res = await request(server).get('/chemical_agents/history/station/nonesiste/CO')
            expect(res.status).toBe(404)
        })

        it('should return 404 if station id exist but there arent data', async () => {
            const res = await request(server).get('/chemical_agents/history/station/id_prova/BENZENE')
            expect(res.status).toBe(404)
        })

        it('should return 400 if the type of agent dont exist', async () => {
            const res = await request(server).get('/chemical_agents/history/station/id_prova/nonesiste')
            expect(res.status).toBe(400)  
        })

    
    })


    describe('GET /filter/avg/:station_id/:type', () => {
        it('should return the avg of all data of a kind of agent of a station', async () => {
            const res = await request(server).get('/chemical_agents/filter/avg/id_prova/CO')
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('value', 100)
        })

        it('should return 400 if type of agent dont exist', async () => {
            const res = await request(server).get('/chemical_agents/filter/avg/id_prova/nonesiste')
            expect(res.status).toBe(400)
            
        })

        it('should return 400 if the station doesnt exist', async () => {
            const res = await request(server).get('/chemical_agents/filter/avg/nonesiste/CO')
            expect(res.status).toBe(404)
            
        })

        it('should return 404 if type of agent exist but there arent values', async () => {
            const res = await request(server).get('/chemical_agents/filter/avg/id_prova/BENZENE')
            expect(res.status).toBe(404)
            
        })
    })


    describe('GET /filter/avg/:station_id/', () => {
        it('should return the avg of all data of a station', async () => {
            const res = await request(server).get('/chemical_agents/filter/avg/id_prova/')
            expect(res.status).toBe(200)
            
            expect(res.body[0].avg).toBe(100)
            expect(res.body[1].avg).toBe(100)
        })


        it('should return 404 if station_id doesent exist', async () => {
            const res = await request(server).get('/chemical_agents/filter/avg/nonesiste')
            expect(res.status).toBe(404)
            
        })
    })
}) 