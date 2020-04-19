const {User} = require('../../models/user');
const request = require('supertest');
let server;

// MANCA IL CONTROLLO DI INVALID PASSWORD -> 400

describe('/auth', () => {

    let user
    let email
    let phone
    let password
    
    beforeEach( async () => {
        server = require('../../index');
        
        await request(server).post('/registration/citizen').send({
            name : 'Ivan',
            surname : 'Giacomoni',
            sex : 'M',
            birthdate : '1998-05-31',
            birthplace : 'Latina',
            email : 'federeristheway@gmail.com',
            phone : '1234567890',
            password : 'aCertainPassword'
        })

    });

    afterEach(async () => {
        await User.deleteMany({})
        await server.close(); 
    });

    const exec_email = () => {
        return request(server).post('/auth/email')
            .send({
                email: email,
                password: password
            })
    }

    const exec_phone =  () => {
        return request(server).post('/auth/phone')
            .send({
                phone: phone,
                password: password
            })
    }

    describe("POST /email", () => {
        
        it('should return 400 if email or password is invalid', async () => {

            email = 1324
            password = 'aCertainPassword'
           
            let res = await exec_email()

            expect(res.status).toBe(400)

            email = 'federeristheway@gmail.com'
            password = 1234
           
            res = await exec_email()

            expect(res.status).toBe(400)
        })

        it('should return 400 if email is wrong', async () => {

            email = 'federeristhewayyyy@gmail.com'
            password = 'aCertainPassword'
           
            res = await exec_email()

            expect(res.status).toBe(400)
        })

        it('should return 400 if password is wrong', async () => {

            email = 'federeristheway@gmail.com'
            password = 'aCertainPassword1'
           
            let res = await exec_email()

            expect(res.status).toBe(400)
        })

        it('should return 200 if email and password are correct', async () => {

            email = 'federeristheway@gmail.com'
            password = 'aCertainPassword'

            res = await exec_email()

            expect(res.status).toBe(200)
        })

    })

    describe("POST /phone", () => {
        
        it('should return 400 if phone or password is invalid', async () => {

            phone = 1324
            password = 'aCertainPassword'
           
            let res = await exec_phone()

            expect(res.status).toBe(400)

            phone = '1234567890'
            password = 1234
           
            res = await exec_phone()

            expect(res.status).toBe(400)
        })

        it('should return 400 if phone is wrong', async () => {

            phone = '1111111111'
            password = 'aCertainPassword'
           
            res = await exec_phone()

            expect(res.status).toBe(400)
        })

        it('should return 400 if password is wrong', async () => {

            phone = '1234567890'
            password = 'aCertainPassword1'
           
            let res = await exec_phone()

            expect(res.status).toBe(400)
        })

        it('should return 200 if email and password are correct', async () => {

            phone = '1234567890'
            password = 'aCertainPassword'

            res = await exec_phone()

            expect(res.status).toBe(200)
        })

    })
})