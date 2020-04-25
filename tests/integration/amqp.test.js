const request = require('supertest')
const config=require('config')
const mongoose = require('mongoose')

const {sendByAmqp}=require('../../amqp/producer')

describe('AMQP', () => {
    beforeEach(async() => {
        server = require('../../index')
    })
    afterEach(async () => {
        
        await server.close()
        
       
    })


    describe('Sending an agent that has value greater than limit', () => {
        
        
        it('should return 200 and to add a new user type: citizien ' , async() => {
          let data=[
              {
                reg_date: "1970-12-1",
                value: 300,
                types: "SO2",
                sensor:"via di casa mia",
                uid:"id",
                lat:"69",
                long:"70"
              },
              {
                reg_date: "1970-12-1",
                value: 10,
                types: "SO2",
                sensor:"via di casa mia3",
                uid:"id2",
                lat:"692",
                long:"703"
              }
          ]
            sendByAmqp(data)
          
        })
    })
})