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
            uid:"id_prova"
        })
        await chemical_agent.save()

        const chemical_agent2 = new Chemical_Agent({
            reg_date: "2019-11-30",
            value: 100,
            types: Agents.SO2,
            sensor:"prova",
            uid:"id_prova"
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


}) 