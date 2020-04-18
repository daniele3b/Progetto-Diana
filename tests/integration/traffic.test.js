const request = require('supertest')
const mongoose = require('mongoose')
const {Agents,Chemical_Agent,validate}=require('../../models/chemical_agents')
const {User} = require('../../models/user');
const {calculateCF}=require('../../helper/registration_helper')

jest.setTimeout(60000)

let server

describe('/traffic', () => {

    let operator_token;
    let citizen_token;
    let admin_token;

    beforeEach( async () => {
        server = require('../../index')

        const chemical_agent = new Chemical_Agent({
            reg_date: "2020-04-12T08:31:12.000+00:00",
            value: 29,
            types: Agents.PM10,
            sensor:"Cinecitta', Roma, Lazio, Italy",
            uid:"9343",
            lat:"41.8482263",
            long:"12.5759027"
        })
        await chemical_agent.save()

        const chemical_agent2 = new Chemical_Agent({
            reg_date: "2020-04-12T08:31:12.000+00:00",
            value: 0.2,
            types: Agents.SO2,
            sensor:"Malagrotta, Roma, Lazio, Italy",
            uid:"9349",
            lat:"41.883706",
            long:"12.3337009"
        })
        await chemical_agent2.save()


        const cf_operator = calculateCF('Ivan','Giacomoni','M','31','05','1998','Latina')

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

            const cf_citizen = calculateCF('Daniele','Bufalieri','M','01','12','1998','Roma')

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
                password : 'aCertainPassword1'
            }).generateAuthToken();

            const cf_admin = calculateCF('Laura','Giacomoni','F','30','04','2001','Latina')

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

    })
    afterEach(async () => {
        await Chemical_Agent.deleteMany({})
        await server.close()
    })



    describe('/GET/:address', () => {
        
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });

        it('should return 400 if invalid address is passed(it contains numbers)', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina 543').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400);

            res = await request(server).get('/traffic/Via Tiburtina 543').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400);
        })

        it("should return 404 if address doesn't exist", async () => {
            // NO ADDRESS
            let res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx').set('x-diana-auth-token', operator_token);
            expect(res1.status).toBe(404);

            res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx').set('x-diana-auth-token', admin_token);
            expect(res1.status).toBe(404);

            // ECUADOR SUPERMARKET :)
            let res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx').set('x-diana-auth-token', operator_token);
            expect(res2.status).toBe(404);

            res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx').set('x-diana-auth-token', admin_token);
            expect(res2.status).toBe(404);
        })
        
        it('should return all current data about traffic into an area specified by a given address', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)

            res = await request(server).get('/traffic/Via Tiburtina').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)
        })

    })

    describe('/GET/:address/sensor', () => {
        
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina/sensor')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina/sensor')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina/sensor')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return 400 if invalid address is passed', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina 543/sensor').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400);

            res = await request(server).get('/traffic/Via Tiburtina 543/sensor').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400);
        })

        it("should return 404 if address doesn't exist", async () => {
            // NO ADDRESS
            let res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx/sensor').set('x-diana-auth-token', operator_token);
            expect(res1.status).toBe(404);

            res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx/sensor').set('x-diana-auth-token', admin_token);
            expect(res1.status).toBe(404);

            // ECUADOR SUPERMARKET :)
            let res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx/sensor').set('x-diana-auth-token', operator_token);
            expect(res2.status).toBe(404);

            res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx/sensor').set('x-diana-auth-token', admin_token);
            expect(res2.status).toBe(404);
        })

        it('should return 404 if no chemical agents are stored in the database', async () => {
            await Chemical_Agent.deleteMany({})
            
            let res = await request(server).get('/traffic/Via Tiburtina/sensor').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404);

            res = await request(server).get('/traffic/Via Tiburtina/sensor').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404);            
        })

        it('should return the nearest sensor for a specified address', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina/sensor').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)

            res = await request(server).get('/traffic/Via Tiburtina/sensor').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)
        })
        
    })

    describe('/GET/:address/sensor/:radius', () => {

        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina/sensor/100')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina/sensor/100')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/traffic/Via Tiburtina/sensor/100')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return 400 if invalid address is passed', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina 543/sensor/45').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400);

            res = await request(server).get('/traffic/Via Tiburtina 543/sensor/45').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400);
        })

        it("should return 404 if address doesn't exist", async () => {
            // NO ADDRESS
            let res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx').set('x-diana-auth-token', operator_token);
            expect(res1.status).toBe(404);

            res1 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxx/sensor/100').set('x-diana-auth-token', admin_token);
            expect(res1.status).toBe(404);

            // ECUADOR SUPERMARKET :)
            let res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx/sensor/100').set('x-diana-auth-token', operator_token);
            expect(res2.status).toBe(404);

            res2 = await request(server).get('/traffic/xxxxxxxxxxxxxxxxxxxxxxxx/sensor/100').set('x-diana-auth-token', admin_token);
            expect(res2.status).toBe(404);
        })

        it('should return 400 if invalid radius is passed', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina/sensor/invalid_radius').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400);

            res = await request(server).get('/traffic/Via Tiburtina/sensor/invalid_radius').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400);

            let res1 = await request(server).get('/traffic/Via Tiburtina/sensor/8.9.1').set('x-diana-auth-token', operator_token);
            expect(res1.status).toBe(400);

            res1 = await request(server).get('/traffic/Via Tiburtina/sensor/8.9.1').set('x-diana-auth-token', admin_token);
            expect(res1.status).toBe(400);

            let res2 = await request(server).get('/traffic/Via Tiburtina/sensor/.7').set('x-diana-auth-token', operator_token);
            expect(res2.status).toBe(400);

            res2 = await request(server).get('/traffic/Via Tiburtina/sensor/.7').set('x-diana-auth-token', admin_token);
            expect(res2.status).toBe(400);
        
            let res3 = await request(server).get('/traffic/Via Tiburtina/sensor/7.').set('x-diana-auth-token', operator_token);
            expect(res3.status).toBe(400);

            res3 = await request(server).get('/traffic/Via Tiburtina/sensor/7.').set('x-diana-auth-token', admin_token);
            expect(res3.status).toBe(400);
        })
        
        it('should return 400 if 0 or a negative number is passed', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina/sensor/-1').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(400);

            res = await request(server).get('/traffic/Via Tiburtina/sensor/-1').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(400);
        })

        it('should return 404 if no chemical agents are stored in the database', async () => {
            await Chemical_Agent.deleteMany({})
            
            let res = await request(server).get('/traffic/Via Tiburtina/sensor/10').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404);

            res = await request(server).get('/traffic/Via Tiburtina/sensor/10').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404);
        })

        it('should return 404 if there are no sensors within the specified radius', async () => {
            let res = await request(server).get('/traffic/Via Tiburtina/sensor/1').set('x-diana-auth-token', operator_token);
            expect(res.status).toBe(404);
            
            res = await request(server).get('/traffic/Via Tiburtina/sensor/1').set('x-diana-auth-token', admin_token);
            expect(res.status).toBe(404);
        })

        it('should return all sensors close to a specified address within a certain specified radius', async () => {
            let res1 = await request(server).get('/traffic/Via Tiburtina/sensor/100').set('x-diana-auth-token', operator_token);
            expect(res1.status).toBe(200);
            expect(res1.body.length).toBeGreaterThan(0)

            res1 = await request(server).get('/traffic/Via Tiburtina/sensor/100').set('x-diana-auth-token', admin_token);
            expect(res1.status).toBe(200);
            expect(res1.body.length).toBeGreaterThan(0)

            let res2 = await request(server).get('/traffic/Via Tiburtina/sensor/100.6').set('x-diana-auth-token', operator_token);
            expect(res2.status).toBe(200);
            expect(res2.body.length).toBeGreaterThan(0)

            res2 = await request(server).get('/traffic/Via Tiburtina/sensor/100.6').set('x-diana-auth-token', admin_token);
            expect(res2.status).toBe(200);
            expect(res2.body.length).toBeGreaterThan(0)
        })
        
    })

})