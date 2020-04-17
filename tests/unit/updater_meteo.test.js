const request = require('supertest')
const {updateMeteo}=require('../../startup/updater_meteo')
const mongoose=require('mongoose')
const {Meteo}=require('../../models/meteo')
const config=require('config')

jest.setTimeout(config.get('updater_to'))

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
  

let server

describe('updater_meteo', () => {

    beforeEach(async() => {
        server = require('../../index')  
        await Meteo.deleteMany({})
        updateMeteo()
    })

    afterEach(async () => {
        await Meteo.deleteMany({})
        await server.close()
    })

    describe('/updater_meteo', async () => {
        it('it should find at least a meteo report ', async () => {
            await sleep(config.get('updater_int')).then(async ()=>{
                let res=await Meteo.find({})
                expect(res.length).toBeGreaterThan(0)
         
            })
        })

        it('it should find be a correct a meteo report ', async () => {
            await sleep(config.get('updater_int')).then(async ()=>{
                let res=await Meteo.findOne({})
                expect(typeof res.datastamp).toBe('number')
                expect(typeof res.descrizione).toBe('string')
                expect(typeof res.t_att).toBe('number')
                expect(typeof res.humidity).toBe('number')
                expect(typeof res.wind).toBe('number')
            })
        })

    })
})