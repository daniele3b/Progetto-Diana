const request = require('supertest')
const mongoose = require('mongoose')
const {Announcement} = require('../../models/announcement')
const {getTokens} = require('../../helper/test_helper')

let server

describe('/announcements', () => {

    let operator_token
    let citizen_token
    let admin_token

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

        const tokens = getTokens()
        
        citizen_token = tokens[0]
        operator_token = tokens[1]
        admin_token = tokens[2]
    })
    afterEach(async () => {
        await server.close()
        await Announcement.deleteMany({})
    })


    describe('GET /', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/announcements')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/announcements')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return the list of all announcements' , async() => {
            let res = await request(server).get('/announcements')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(3)

            res = await request(server).get('/announcements')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(3)

            res = await request(server).get('/announcements')
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(3)
        })
    })


    describe('GET /:CF', () => {
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/announcements/1111111111111111')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/announcements/1111111111111111')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/announcements/1111111111111111')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return the list of the announcements published by the operator with the given CF', async() => {
            let res = await request(server).get('/announcements/1111111111111111')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the first test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()

            res = await request(server).get('/announcements/1111111111111111')
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the first test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()
        })

        it('should return 404 if no announcement has the given CF', async() => {
            let res = await request(server).get('/announcements/1111111111111113')
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404)

            res = await request(server).get('/announcements/1111111111111113')
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(404)
        })
    })

    
    describe('GET /since/starting_from/:date_start', () => {
        const date_start1 = "March 2020 , 21 17:30"
        const date_start2 = "March 2020 , 25 18:30"

        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/announcements/since/starting_from/' + date_start1)
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/announcements/since/starting_from/' + date_start1)
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });
        
        it('should return the announcements that refers to a start date following the provided date', async () => {
            let res = await request(server).get('/announcements/since/starting_from/' + date_start1)
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()

            res = await request(server).get('/announcements/since/starting_from/' + date_start1)
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()

            res = await request(server).get('/announcements/since/starting_from/' + date_start1)
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()
        })

        it('should return 404 if no announcement about a date after the provided date is found', async() => {
            let res = await request(server).get('/announcements/since/starting_from/' + date_start2)
                .set('x-diana-auth-token', citizen_token);
        
            expect(res.status).toBe(404)

            res = await request(server).get('/announcements/since/starting_from/' + date_start2)
                .set('x-diana-auth-token', operator_token);
        
            expect(res.status).toBe(404)

            res = await request(server).get('/announcements/since/starting_from/' + date_start2)
                .set('x-diana-auth-token', admin_token);
        
            expect(res.status).toBe(404)
        })
    })


    describe('GET /before/terminated_before/:date_end', () => {
        const date_stop = "March 2020 , 23 18:30"
        
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/announcements/before/terminated_before/' + date_stop)
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/announcements/before/terminated_before/' + date_stop)
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });
        
        it('should return the announcements that refers to a start date before the provided date ', async() => {
            let res = await request(server).get('/announcements/before/terminated_before/' + date_stop)
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the first test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()

            res = await request(server).get('/announcements/before/terminated_before/' + date_stop)
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the first test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()

            res = await request(server).get('/announcements/before/terminated_before/' + date_stop)
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the first test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
        })
    })


    describe('GET /:date_start/:date_end', () => {
        const date_start1 = "March 2020 , 22 17:30"
        const date_end1 = "March 2020 , 26 00:00"
        const date_start2 = "March 2020 , 26 17:30"
        const date_end2 = "March 2020 , 30 00:00"
        
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/announcements/' +date_start1+ '/' +date_end1)
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/announcements/' +date_start1+ '/' +date_end1)
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });
        
        it('should return the list of all announcements between the start and end date', async () => {

            let res = await request(server).get('/announcements/' +date_start1+ '/' +date_end1)
            .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()

            res = await request(server).get('/announcements/' +date_start1+ '/' +date_end1)
            .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()

            res = await request(server).get('/announcements/' +date_start1+ '/' +date_end1)
            .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some(ann => ann.description === 'This is the second test')).toBeTruthy()
            expect(res.body.some(ann => ann.description === 'This is the third test')).toBeTruthy()
        })

        it('should return 404 if no annoucement belong to the specified dates range', async() => {

            let res = await request(server).get('/announcements/' +date_start2+ '/' +date_end2)
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(404)

            res = await request(server).get('/announcements/' +date_start2+ '/' +date_end2)
                .set('x-diana-auth-token', operator_token);

            expect(res.status).toBe(404)

            res = await request(server).get('/announcements/' +date_start2+ '/' +date_end2)
                .set('x-diana-auth-token', admin_token);

            expect(res.status).toBe(404)
        })
    })


    describe('POST /', () => {

        let CF
        let start 
        let end 
        let description
        let token

        const exec = async () => {
            return await request(server).post('/announcements')
                .set('x-diana-auth-token', token)
                .send({CF,start,end,description})
        }

        it('should return 401 if user is not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
            token = 'invalid_token'

            const res = await exec()

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {
            token = citizen_token

            const res = await exec()

            expect(res.status).toBe(403);
        });

        it('should save the announcement if it is valid' , async() => {
            CF = '1111111111111111'
            start = "April 2020 , 30 13:00"
            end = "April 2020 , 31 14:00"
            description = "This is a test of the post endpoint"
            
            token = operator_token
            let res = await exec()

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('description','This is a test of the post endpoint')

            token = admin_token
            res = await exec()

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('description','This is a test of the post endpoint')
        })

        it('should return 400 if the request is not valid', async() => {
            CF = 'a'

            token = operator_token
            let res = await exec()
            
            expect(res.status).toBe(400)

            token = admin_token
            res = await exec()
            
            expect(res.status).toBe(400)
        })
    })


    describe('PUT/:id' , () => {

        let new_CF
        let new_start 
        let new_end 
        let new_description
        let id
        let token 

        beforeEach(async () => {
            ann_test = new Announcement({
                CF: "abcdefghilmno123",
                start: "March 2020 , 20 17:30" ,
                end: "March 2020 , 21 18:30",
                description: "This is the PUT test"
            })
            await ann_test.save()

            id = ann_test._id
            new_CF = '1111111111111111'
            new_start = "March 2020 , 20 17:30"
            new_description = "Updated announcement"
        })

        const exec = async () => {
            return await request(server).put('/announcements/' +id)
            .set('x-diana-auth-token', token)
            .send({CF: new_CF , start:new_start, description:new_description})
        }
        
        it('should return 401 if user is not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
            token = 'invalid_token'

            const res = await exec()

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {
            token = citizen_token

            const res = await exec()

            expect(res.status).toBe(403);
        });

        it('should return 400 if the CF is not sixteen characters long', async() => {
            new_CF = 'a'

            token = operator_token
            let res = await exec()
            expect(res.status).toBe(400)

            token = admin_token
            res = await exec()
            expect(res.status).toBe(400)
        })


        it('should return 400 if the date start if missing', async() => {
            new_start = ""

            token = operator_token
            let res = await exec()
            expect(res.status).toBe(400)

            token = admin_token
            res = await exec()
            expect(res.status).toBe(400)
        })

        
        it('should return 404 if no announcement with the given id is found', async() => {
            id = mongoose.Types.ObjectId()

            token = operator_token
            let res = await exec()
            expect(res.status).toBe(404)

            token = admin_token
            res = await exec()
            expect(res.status).toBe(404)
        })
        

        it('should return 400 if id is invalid', async() => {
            id = 1

            token = 'a token'
            const res = await exec()
            expect(res.status).toBe(400)
        })

        it('should update the given announcement if input is valid', async() => {
            
            token = operator_token
            let res = await exec()

            let new_announcement = await Announcement.findById(id)

            expect(res.status).toBe(200)
            expect(new_announcement.description).toBe('Updated announcement')

            token = admin_token
            res = await exec()

            new_announcement = await Announcement.findById(id)

            expect(res.status).toBe(200)
            expect(new_announcement.description).toBe('Updated announcement')
        })

        it('should return the updated announcement if input is valid' , async() => {
            token = operator_token
            let res = await exec()

            expect(res.status).toBe(200)

            expect(res.body).toHaveProperty('_id')
            expect(res.body).toHaveProperty('description', new_description)

            token = admin_token
            res = await exec()

            expect(res.status).toBe(200)

            expect(res.body).toHaveProperty('_id')
            expect(res.body).toHaveProperty('description', new_description)
        })
    })


    describe('DELETE/:id' , () => {

        let id1
        let id2
        let token

        beforeEach(async () => {
            ann_test1 = new Announcement({
                CF: "abcdefghilmno123",
                start: "March 2020 , 20 17:30" ,
                end: "March 2020 , 21 18:30",
                description: "This is the PUT test"
            })
            await ann_test1.save()

            id1 = ann_test1._id

            ann_test2 = new Announcement({
                CF: "abcdefghilmno123",
                start: "March 2020 , 20 17:30" ,
                end: "March 2020 , 21 18:30",
                description: "This is the PUT test"
            })
            await ann_test2.save()

            id2 = ann_test2._id
        })

        const exec1 = async () => {
            return await request(server).delete('/announcements/' +id1)
            .set('x-diana-auth-token', token)
        }

        const exec2 = async () => {
            return await request(server).delete('/announcements/' +id2)
            .set('x-diana-auth-token', token)
        }
        
        it('should return 401 if user is not logged in', async () => {
            token = ''

            const res = await exec1()

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
            token = 'invalid_token'

            const res = await exec1()

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {
            token = citizen_token

            const res = await exec1()

            expect(res.status).toBe(403);
        });

        it('should return 400 if the given id is not valid' , async () => {
            id1 = 1

            token = operator_token
            let res = await exec1()

            expect(res.status).toBe(400)

            token = admin_token
            res = await exec1()

            expect(res.status).toBe(400)
        })


        it('should return 404 if no annoucement exists with the given id' , async () => {
            id1 = mongoose.Types.ObjectId()
            
            token = operator_token
            let res = await exec1()

            expect(res.status).toBe(404)

            token = admin_token
            res = await exec1()

            expect(res.status).toBe(404)
        })

        it('should delete the announcement if input is valid', async() => {
            
            token = operator_token
            let res = await exec1()
            let ann = await Announcement.findById(id1)

            expect(res.status).toBe(200)
            expect(ann).toBeNull()

            
            token = admin_token
            res = await exec2()
            ann = await Announcement.findById(id2)

            expect(res.status).toBe(200)
            expect(ann).toBeNull()
        })

        it('should return the removed announcement if input is valid' , async () => {
            token = operator_token
            let res = await exec1()

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('_id', ann_test1._id.toHexString());
            expect(res.body).toHaveProperty('description', ann_test1.description)

            token = admin_token
            res = await exec2()

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('_id', ann_test2._id.toHexString());
            expect(res.body).toHaveProperty('description', ann_test2.description)
        })
        
    })
}) 