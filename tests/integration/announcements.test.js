const request = require('supertest')
const mongoose = require('mongoose')
const {Announcement} = require('../../models/announcement')

let server

describe('/announcements', () => {
    beforeEach(async() => {
        server = require('../../index')

        const announcement1 = new Announcement({
            CF: "1111111111111111",
            start: "March 2020 , 20 17:30" ,
            end: "March 2020 , 21 18:30",
            description: "This is the first test"
        })
        await announcement1.save()

        const announcement2 = new Announcement({
            CF: "1111111111111112",
            start: "March 2020 , 22 17:30" ,
            end: "March 2020 , 23 18:30",
            description: "This is the second test"
        })
        await announcement2.save() 

        const announcement3 = new Announcement({
            CF: "1111111111111111",
            start: "March 2020 , 24 17:30" ,
            end: "March 2020 , 25 18:30",
            description: "This is the third test"
        }) 
        await announcement3.save()
    })
    afterEach(async () => {
        await server.close()
        await Announcement.remove({})
    })


    describe('GET /', () => {
        it('should return the list of all announcements' , async() => {
            const res = await request(server).get('/announcements')

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(3)
        })
    })


    describe('GET /:CF', () => {
        it('should return the list of the announcements published by the operator with the given CF', async() => {
            const res = await request(server).get('/announcements/1111111111111111')

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the first test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()
        })

        it('should return 404 if no announcement has the given CF', async() => {
            const res = await request(server).get('/announcements/1111111111111113')

            expect(res.status).toBe(404)
        })
    })


    describe('GET /:date_start/:date_end', () => {
        it('should return the list of all announcements between the start and end date', async () => {
            const date_start = "March 2020 , 22 17:30"
            const date_end = "March 2020 , 26 00:00"

            const res = await request(server).get('/announcements/' +date_start+ '/' +date_end)

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()
        })

        it('should return 404 if no annoucement belong to the specified dates range', async() => {
            const date_start = "March 2020 , 26 17:30"
            const date_end = "March 2020 , 30 00:00"

            const res = await request(server).get('/announcements/' +date_start+ '/' +date_end)

            expect(res.status).toBe(404)
        })
    })


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
    })
}) 