const request = require('supertest')
const mongoose = require('mongoose')
const {User,validateUser}=require('../../models/user')

let server

let name
let surname
let birthdate
let birthplace
let email
let phone
let sex
let password

describe('/registration', () => {
    beforeEach(async() => {
        server = require('../../index')
        name='Alessandra'
        surname='Ciacia'
        birthdate='1973-02-18'
        birthplace='Guidonia Montecelio' 
        email='a.ciacia@alice.it'
        phone='3281517382'
        sex='F'
        password='prova'
    })
    afterEach(async () => {
        
        await User.deleteMany({})
        await server.close()
        
       
    })


    describe('POST /', () => {
        it('should return 200 and to add a new user type: citizien ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name:name ,surname:surname, birthdate:birthdate,birthplace:birthplace,email:email,phone:phone,sex:sex,password:password})
           expect(res.status).toBe(200)
        })

        it('should return 200 and to add a new user without email type: citizien ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name:name ,surname:surname, birthdate:birthdate,birthplace:birthplace,phone:phone,sex:sex,password:password})
           expect(res.status).toBe(200)
        })

        it('should return 200 and to add a new user without phone type: citizien ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name:name ,surname:surname, birthdate:birthdate,birthplace:birthplace,email:email,sex:sex,password:password})
           expect(res.status).toBe(200)
        })

        it('should return 404 if email and phone arent given ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name:name ,surname:surname, birthdate:birthdate,birthplace:birthplace,sex:sex,password:password})
           expect(res.status).toBe(404)
        })

        it('should return 404 if user already exist ' , async() => {
            let res = await request(server).post('/registration/citizen').send({name:name ,surname:surname, birthdate:birthdate,birthplace:birthplace,sex:sex,password:password})
            res = await request(server).post('/registration/citizen').send({name:name ,surname:surname, birthdate:birthdate,birthplace:birthplace,sex:sex,password:password})
            expect(res.status).toBe(404)
        })
      
    })


    
}) 