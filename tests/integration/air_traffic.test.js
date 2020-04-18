const request = require('supertest')
const {User} = require('../../models/user');
const {calculateCF}=require('../../helper/registration_helper')

let server

describe('/air_traffic', () => {

    let operator_token;
    let citizen_token;
    let admin_token;

    beforeEach(() => {
        server = require('../../index')

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
        await server.close()
    })

    describe('/GET', () => {
        
        it('should return 401 if user is not logged in', async () => {

            const res = await request(server)
                .get('/air_traffic')
                .set('x-diana-auth-token', '');

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {

            const res = await request(server)
                .get('/air_traffic')
                .set('x-diana-auth-token', 'invalid_token');

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not an operator or an admin', async () => {

            const res = await request(server)
                .get('/air_traffic')
                .set('x-diana-auth-token', citizen_token);

            expect(res.status).toBe(403);
        });
        
        it('should return:\n  -404 if there are no planes in the specified area\n  -200 if there are planes in the area specified', async () => {
            let res = await request(server).get('/air_traffic').set('x-diana-auth-token', operator_token);
            if(res.status == 404)
                expect(res.status).toBe(404)
            else
                expect(res.status).toBe(200)

            res = await request(server).get('/air_traffic').set('x-diana-auth-token', admin_token);
            if(res.status == 404)
                expect(res.status).toBe(404)
            else
                expect(res.status).toBe(200)
        })

    })
})