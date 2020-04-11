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

/*
    describe('POST /', () => {

        let CF
        let start 
        let end 
        let description

        const exec = async () => {
            return await request(server).post('/announcements').send({CF,start,end,description})
        }

        it('should save the announcement if it is valid' , async() => {
            CF = '1111111111111111'
            start = "April 2020 , 30 13:00"
            end = "April 2020 , 31 14:00"
            description = "This is a test of the post endpoint"

            const res = await exec()

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('description','This is a test of the post endpoint')
        })

        it('should return 400 if the request is not valid', async() => {
            CF = 'a'

            const res = await exec()
            
            expect(res.status).toBe(400)
        })
    })*/
}) 