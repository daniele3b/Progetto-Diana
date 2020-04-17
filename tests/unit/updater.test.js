const request = require('supertest')
const {updateChemicalAgents}=require('../../startup/updater')
const mongoose=require('mongoose')
const {Agents,Chemical_Agent,validate}=require('../../models/chemical_agents')
const config=require('config')
const {sleep}=require('../../helper/test_helper')

jest.setTimeout(config.get('updater_to'))


let server

describe('updater', () => {

    beforeEach(async() => {
        server = require('../../index')  
        await Chemical_Agent.deleteMany({})
        updateChemicalAgents()
    })

    afterEach(async () => {
        await Chemical_Agent.deleteMany({})
        await server.close()
    })

    describe('/updater', async () => {
        it('it should return a list of elements about data of all sensor ', async () => {
            await sleep(config.get('updater_int')).then(async ()=>{
                let res=await Chemical_Agent.find({})
               // console.log(res.length)
                expect(res.length).toBeGreaterThan(0)
         
            })
        })

    })
})



