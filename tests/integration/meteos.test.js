const request = require('supertest')
const mongoose = require('mongoose')
const {Meteo, UVSchema} = require('../../models/meteo')

let server

describe('/weather', () => {
    beforeEach(async() => {
        server = require('../../index')

        const meteo = new Meteo({ 
            data: '2020-03-30T21:30:13.478Z',
            datastamp: '12345678',
            descrizione: 'Clear sky',
            t_att: '14',
            humidity: '60',
            wind: '2'
        })
        await meteo.save()

        const  uvschema = new UVSchema({
            uv_value: 1.234,
            uv_value_time: "2020-04-15T20:05:38.355Z",
            uv_max: 1.234,
            uv_max_time: "2020-04-15T20:05:38.355Z",
            ozone_value: 1.234,
            ozone_time: "2020-04-15T20:05:38.355Z",
            data: "2020-04-15"
        })
        await uvschema.save()
    })
    afterEach(async () => {
        await Meteo.deleteMany({})
        await UVSchema.deleteMany({})
        await server.close()
       
    })
    /*
    describe('GET /uv/now', () => {
        it('should return the last UV rays values ' , async() => {
            const res = await request(server).get('/weather/uv/now')
            expect(res).not.toBeNull();
            expect(res.status).toBe(200)
            expect(typeof res.body.uv_value).toBe('number')
            expect(typeof res.body.uv_value_time).toBe('string')
            expect(typeof res.body.uv_max).toBe('number')
            expect(typeof res.body.uv_max_time).toBe('string')
            expect(typeof res.body.ozone_value).toBe('number')
            expect(typeof res.body.ozone_time).toBe('string')
        })
    })
    */
    describe('GET /uv/:date', () => {
        it('should return the correct values ' , async() => {
            const res = await request(server).get('/weather/uv/2020-04-15')
            expect(res).not.toBeNull();
            expect(res.status).toBe(200)
            expect(typeof res.body.uv_max).toBe('number')
            expect(typeof res.body.uv_max_time).toBe('string')
            expect(typeof res.body.ozone_value).toBe('number')
            expect(typeof res.body.ozone_time).toBe('string')
        })
        it('should return error: Bad request' , async() => {
            const res = await request(server).get('/weather/uv/xxxxxxxxxxx')
            expect(res.status).toBe(400)  
        })
        it('should return error: Not Found', async() => {
            const res = await request(server).get('/weather/uv/3030-10-10')
            expect(res.status).toBe(404)  
        })
    })

    describe('GET /report/last', () => {
        it('should return the correct report ' , async() => {
            const res = await request(server).get('/weather/report/last')
            expect(typeof res.body.data).toBe('string')
            expect(typeof res.body.datastamp).toBe('number')
            expect(typeof res.body.descrizione).toBe('string')
            expect(typeof res.body.t_att).toBe('number')
            expect(typeof res.body.humidity).toBe('number')
            expect(typeof res.body.wind).toBe('number')
            expect(res.status).toBe(200)
        })
    });

    describe('GET /report/7daysforecast', () => {
        it('should return the correct report ' , async() => {
            const res = await request(server).get('/weather/report/7daysforecast')
            for(i=0;i<1;i++){
                expect(typeof res.body.array[i]._id).toBe('string')
                expect(typeof res.body.array[i].data).toBe('string')
                expect(typeof res.body.array[i].datastamp).toBe('number')
                expect(typeof res.body.array[i].descrizione).toBe('string')
                expect(typeof res.body.array[i].t_min).toBe('number')
                expect(typeof res.body.array[i].t_max).toBe('number')
                expect(typeof res.body.array[i].humidity).toBe('number')
                expect(typeof res.body.array[i].wind).toBe('number')
            }
            expect(res.status).toBe(200)
        })
    });

    describe('GET /report/history/:date', () => {
        it('should return the correct values ' , async() => {
            const res = await request(server).get('/weather/report/history/2020-04-12')
            expect(res).not.toBeNull();
            expect(res.status).toBe(200)
            expect(typeof res.body.date).toBe('string')
            expect(typeof res.body.t_min).toBe('number')
            expect(typeof res.body.t_max).toBe('number')
            expect(typeof res.body.wind).toBe('number')
            expect(typeof res.body.humidity).toBe('number')
        })
        it('should return error: Bad request' , async() => {
            const res = await request(server).get('/weather/report/history/xxxxxxxxxxx')
            expect(res.status).toBe(400)  
        })
        it('should return error: Not Found' , async() => {
            const res = await request(server).get('/weather/report/history/3000-12-12')
            expect(res.status).toBe(404)  
        })
    })


});