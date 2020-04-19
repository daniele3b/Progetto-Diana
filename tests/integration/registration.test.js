const request = require('supertest')
const config=require('config')
const mongoose = require('mongoose')
const {User,validateUser}=require('../../models/user')
const {calculateCF}=require('../../helper/registration_helper')
const bcrypt=require('bcrypt')
const {getTokens} = require('../../helper/test_helper')

let server
let name
let surname
let birthdate
let birthplace
let email
let phone
let sex
let password
let operator_token;
let citizen_token;
let admin_token;
let cf_citizen
let cf_operator
let cf_admin 

describe('/registration', () => {
    beforeEach(async() => {

        cf_operator = calculateCF('Ivan','Giacomoni','M','31','05','1998','Latina')
        cf_citizen = calculateCF('Daniele','Bufalieri','M','02','12','1998','Roma')
        cf_admin = calculateCF('Laura','Giacomoni','F','30','04','2001','Latina')

        const tokens=getTokens()

                
        citizen_token = tokens[0]
        operator_token = tokens[1]
        admin_token = tokens[2]


        server = require('../../index')
    })
    afterEach(async () => {
        
        await User.deleteMany({})
        await server.close()
        
       
    })


    describe('POST /citizen', () => {
        it('should return 200 and to add a new user type: citizien ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
           expect(res.status).toBe(200)
        })

        it('should return 200 and to add a new user without email type: citizien ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma',phone : '1234567890',password : 'aCertainPassword!'})
           expect(res.status).toBe(200)
        })

        it('should return 200 and to add a new user without phone type: citizien ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',password : 'aCertainPassword!'})
           expect(res.status).toBe(200)
        })

        it('should return 404 if email and phone arent given ' , async() => {
            const res = await request(server).post('/registration/citizen').send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma',password : 'aCertainPassword!'})
           expect(res.status).toBe(404)
        })

        it('should return 404 if user already exist ' , async() => {
            let res = await request(server).post('/registration/citizen').send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
            res = await request(server).post('/registration/citizen').send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
            expect(res.status).toBe(404)
        })
      
    })


    describe('POST /citizen/change_pw',()=>{

        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .post('/registration/citizen/change_pw')
                .send({old_pw:'aCertainPassword!',new_pw:'newPassword!'})
                .set('x-diana-auth-token', '');
            expect(res.status).toBe(401);
        });


        it('should return 200 if user is logged in and all field is setted', async () => {
            const salt = await bcrypt.genSalt(config.get('pw_salt'));
           
        
             let us=new User({CF:cf_citizen,name : 'Daniele',surname : 'Bufalieri',type:'cittadino',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
             us.password= await bcrypt.hash(us.password, salt);
             await us.save()
          
            const res = await request(server)
                .post('/registration/citizen/change_pw')
                .send({old_pw:'aCertainPassword!',new_pw:'newPassword!'})
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(200);
        });



        it('should return 404 if user doesnt exist in and all field is setted', async () => {
          
            const res = await request(server)
                .post('/registration/citizen/change_pw')
                .send({old_pw:'aCertainPassword!',new_pw:'newPassword!'})
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(404);
        });


        
        it('should return 400 if user exist but he isnt a cittadino', async () => {
            const salt = await bcrypt.genSalt(config.get('pw_salt'));
           
            let us=new User({CF:cf_citizen,name : 'Daniele',surname : 'Bufalieri',type:'operatore',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
            us.password= await bcrypt.hash(us.password, salt);
            await us.save()
            const res = await request(server)
                .post('/registration/citizen/change_pw')
                .send({old_pw:'aCertainPassword!',new_pw:'newPassword!'})
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(400);
        });


        it('should return 400 if user exist but old pw is wrong', async () => {
            const salt = await bcrypt.genSalt(config.get('pw_salt'));
           
            let us=new User({CF:cf_citizen,name : 'Daniele',surname : 'Bufalieri',type:'cittadino',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
            us.password= await bcrypt.hash(us.password, salt);
            await us.save()
            const res = await request(server)
                .post('/registration/citizen/change_pw')
                .send({old_pw:'error',new_pw:'newPassword!'})
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(400);
        });


        
        it('should return 400 if user exist but old pw and new pw arent setted', async () => {
            const salt = await bcrypt.genSalt(config.get('pw_salt'));
           
            let us=new User({CF:cf_citizen,name : 'Daniele',surname : 'Bufalieri',type:'cittadino',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
            us.password= await bcrypt.hash(us.password, salt);
            await us.save()
            const res = await request(server)
                .post('/registration/citizen/change_pw')
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(400);
        });


    })

    describe('POST /operator',()=>{

        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .post('/registration/operator')
                .send({old_pw:'aCertainPassword!',new_pw:'newPassword!'})
                .set('x-diana-auth-token', '');
            expect(res.status).toBe(401);
        });


        it('should return 403 if user is logged in and he is a citizien', async () => {

            const res = await request(server)
                .post('/registration/operator')
                .send({old_pw:'aCertainPassword!',new_pw:'newPassword!'})
                .set('x-diana-auth-token', citizen_token);
            expect(res.status).toBe(403);
        });


        it('should return 403 if user is logged in and he is an operator', async () => {

            const res = await request(server)
                .post('/registration/operator')
                .send({old_pw:'aCertainPassword!',new_pw:'newPassword!'})
                .set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(403);
        });


        it('should return 400 if in the body request there arent value', async () => {
            const res = await request(server)
                .post('/registration/operator')
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400);
        });


        it('should return 200 if user is logged in ,he is an admin and all field are filled', async () => {

            const res = await request(server)
                .post('/registration/operator')
                .send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',phone : '1234567890',password : 'aCertainPassword!'})
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200);
        });


        it('should return 200 if user is logged in ,he is an admin and fields are filled without email', async () => {

            const res = await request(server)
                .post('/registration/operator')
                .send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma',phone : '1234567890',password : 'aCertainPassword!'})
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200);
        });


        it('should return 200 if user is logged in ,he is an admin and fields are filled without phone', async () => {

            const res = await request(server)
                .post('/registration/operator')
                .send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma', email : 'federeristheway@gmail.com',password : 'aCertainPassword!'})
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200);
        });


        it('should return 404 if user is logged in ,he is an admin and fields are filled without phone and email', async () => {

            const res = await request(server)
                .post('/registration/operator')
                .send({name : 'Daniele',surname : 'Bufalieri',sex: 'M',birthdate : '1998-12-02', birthplace : 'Roma',password : 'aCertainPassword!'})
                .set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404);
        });

        //manca test utente già esistente
    });
    
}) 