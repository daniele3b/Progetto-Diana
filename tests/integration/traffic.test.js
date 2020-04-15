const request = require('supertest')
const mongoose = require('mongoose')
const {Agents,Chemical_Agent,validate}=require('../../models/chemical_agents')

jest.setTimeout(50000)

let server

describe('/traffic', () => {
    beforeEach( async () => {
        server = require('../../index')

        const chemical_agent = new Chemical_Agent({
            reg_date: "2020-04-12T08:31:12.000+00:00",
            value: 29,
            types: Agents.PM10,
            sensor:"Cinecitta', Roma, Lazio, Italy",
            uid:"9343",
            lat:"41.8482263",
            long:"12.5759027"
        })
        await chemical_agent.save()

        const chemical_agent2 = new Chemical_Agent({
            reg_date: "2020-04-12T08:31:12.000+00:00",
            value: 0.2,
            types: Agents.SO2,
            sensor:"Malagrotta, Roma, Lazio, Italy",
            uid:"9349",
            lat:"41.883706",
            long:"12.3337009"
        })
        await chemical_agent2.save()

    })
    afterEach(async () => {
        await Chemical_Agent.deleteMany({})
        await server.close()
    })

    describe('/GET/:address', () => {
        it('should return 400 if invalid address is passed(it contains numbers)', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina 543');
            expect(res.status).toBe(400);
        })

        it("should return 404 if address doesn't exist", async () => {
            // NO ADDRESS
            const res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx');
            expect(res1.status).toBe(404);

            // ECUADOR SUPERMARKET :)
            const res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx');
            expect(res2.status).toBe(404);
        })
        
        it('should return all current data about traffic into an area specified by a given address', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)
        })

    })

    describe('/GET/:address/sensor', () => {

        it('should return 400 if invalid address is passed', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina 543/sensor');
            expect(res.status).toBe(400);
        })

        it("should return 404 if address doesn't exist", async () => {
            // NO ADDRESS
            const res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx');
            expect(res1.status).toBe(404);

            // ECUADOR SUPERMARKET :)
            const res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx');
            expect(res2.status).toBe(404);
        })

        it('should return 404 if no chemical agents are stored in the database', async () => {
            await Chemical_Agent.deleteMany({})
            
            const res = await request(server).get('/traffic/Via Tiburtina/sensor');
            expect(res.status).toBe(404);
        })

        it('should return the nearest sensor for a specified address', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina/sensor');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)
        })
        
    })

    describe('/GET/:address/sensor/:radius', () => {

        it('should return 400 if invalid address is passed', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina 543/sensor/45');
            expect(res.status).toBe(400);
        })

        it("should return 404 if address doesn't exist", async () => {
            // NO ADDRESS
            const res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx');
            expect(res1.status).toBe(404);

            // ECUADOR SUPERMARKET :)
            const res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx');
            expect(res2.status).toBe(404);
        })

        it('should return 400 if invalid radius is passed', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina/sensor/invalid_radius');
            expect(res.status).toBe(400);

            const res1 = await request(server).get('/traffic/Via Tiburtina/sensor/8.9.1');
            expect(res1.status).toBe(400);

            const res2 = await request(server).get('/traffic/Via Tiburtina/sensor/.7');
            expect(res2.status).toBe(400);
        
            const res3 = await request(server).get('/traffic/Via Tiburtina/sensor/7.');
            expect(res3.status).toBe(400);
        })
        
        it('should return 400 if 0 or a negative number is passed', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina/sensor/-1');
            expect(res.status).toBe(400);
        })

        it('should return 404 if no chemical agents are stored in the database', async () => {
            await Chemical_Agent.deleteMany({})
            
            const res = await request(server).get('/traffic/Via Tiburtina/sensor/10');
            expect(res.status).toBe(404);
        })

        it('should return 404 if there are no sensors within the specified radius', async () => {
            const res = await request(server).get('/traffic/Via Tiburtina/sensor/1');
            expect(res.status).toBe(404);    
        })

        it('should return all sensors close to a specified address within a certain specified radius', async () => {
            const res1 = await request(server).get('/traffic/Via Tiburtina/sensor/100');
            expect(res1.status).toBe(200);
            expect(res1.body.length).toBeGreaterThan(0)

            const res2 = await request(server).get('/traffic/Via Tiburtina/sensor/100.6');
            expect(res2.status).toBe(200);
            expect(res2.body.length).toBeGreaterThan(0)
        })
        
    })  

})