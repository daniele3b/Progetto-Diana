const request = require('supertest')
const config=require('config')
const mongoose = require('mongoose')
const {User,validateUser}=require('../../models/user')
const {calculateCF}=require('../../helper/registration_helper')
const bcrypt=require('bcrypt')


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


        operator_token = new User({
            CF : cf_operator,
            type : 'operatore',
            name : 'Ivan',
            surname : 'Giacomoni',
            sex : 'M',
            birthdate : '1998-05-31',
            birthplace : 'Latina',
            email : 'federeristheway@gmail.com',
            phone : '1234567890',
            password : 'aCertainPassword'
        }).generateAuthToken();



        cf_citizen = calculateCF('Daniele','Bufalieri','M','02','12','1998','Roma')

            citizen_token = new User({
                CF : cf_citizen,
                type : 'cittadino',
                name : 'Daniele',
                surname : 'Bufalieri',
                sex : 'M',
                birthdate : '1998-12-02',
                birthplace : 'Roma',
                email : 'federeristheway@gmail.com',
                phone : '1234567890',
                password : 'aCertainPassword!'
            }).generateAuthToken();

             cf_admin = calculateCF('Laura','Giacomoni','F','30','04','2001','Latina')

            admin_token = new User({
                CF : cf_admin,
                type : 'admin',
                name : 'Laura',
                surname : 'Giacomoni',
                sex : 'F',
                birthdate : '2001-04-30',
                birthplace : 'Latina',
                email : 'emailDiLaura@gmail.com',
                phone : '1234567893',
                password : 'aCertainPassword2'
            }).generateAuthToken();


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


    describe('POST /citizen', () => {
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





    })


    
}) 